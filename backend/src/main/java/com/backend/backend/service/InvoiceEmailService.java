package com.backend.backend.service;

import com.backend.backend.api.exception.EmailException;
import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.entity.ProductEntity;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import java.io.ByteArrayOutputStream;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@Service
public class InvoiceEmailService {

    private final JavaMailSender mailSender;

    public InvoiceEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public void sendInvoiceEmail(InvoiceEntity invoice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(invoice.getCustomer().getEmail());
            helper.setSubject("Order Confirmed - Invoice #" + invoice.getId());
            helper.setText(buildHtml(invoice), true);

            byte[] pdfBytes = buildPdf(invoice);
            helper.addAttachment("invoice-" + invoice.getId() + ".pdf",
                    new jakarta.mail.util.ByteArrayDataSource(pdfBytes, "application/pdf"));

            mailSender.send(message);
        } catch (MessagingException | DocumentException ex) {
            throw new EmailException("Failed to send invoice email");
        }
    }

    public void sendWishlistEmail(ProductEntity p, String email, double discount){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(email);
            helper.setSubject("Item in your wishlist is now on sale!");
            String msg = String.format("%s product is now on %.2f%% sale!", p.getProductName(), discount);
            helper.setText(msg, false);
            mailSender.send(message);
        }
        catch (MessagingException e) {
            throw new EmailException("Failed to send wishlist email");
        }
    }

    public void sendRefundEmail(RefundEmailDetails refund) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(refund.customerEmail());
            helper.setSubject("Refund Confirmed - Invoice #" + refund.invoiceId());
            helper.setText(buildRefundHtml(refund), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new EmailException("Failed to send refund email");
        }
    }

    private byte[] buildPdf(InvoiceEntity invoice) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, out);
        doc.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 12);
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);

        doc.add(new Paragraph("INVOICE", titleFont));
        doc.add(new Paragraph("Invoice No: " + invoice.getId(), normalFont));
        doc.add(new Paragraph("Date: " + invoice.getDate(), normalFont));
        doc.add(new Paragraph("Customer: " + invoice.getCustomer().getName()
                + " " + invoice.getCustomer().getSurname(), normalFont));
        doc.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4, 1, 2, 2});

        for (String header : new String[]{"Product", "Qty", "Unit Price", "Total"}) {
            PdfPCell cell = new PdfPCell(new Phrase(header, boldFont));
            cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
            cell.setPadding(6);
            table.addCell(cell);
        }

        for (InvoiceItemEntity item : invoice.getItems()) {
            table.addCell(new Phrase(item.getProduct().getProductName(), normalFont));
            table.addCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
            table.addCell(new Phrase(String.format("$%.2f", item.getUnitPrice()), normalFont));
            table.addCell(new Phrase(String.format("$%.2f", item.getTotalPrice()), normalFont));
        }

        PdfPCell totalLabel = new PdfPCell(new Phrase("Grand Total", boldFont));
        totalLabel.setColspan(3);
        totalLabel.setPadding(6);
        table.addCell(totalLabel);

        PdfPCell totalValue = new PdfPCell(
                new Phrase(String.format("$%.2f", invoice.getTotalPrice()), boldFont));
        totalValue.setPadding(6);
        table.addCell(totalValue);

        doc.add(table);
        doc.close();

        return out.toByteArray();
    }

    private String buildHtml(InvoiceEntity invoice) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
        <html><body>
        <h2>Thank you for your order!</h2>
        <p>Dear <strong>%s %s</strong>,</p>
        <p>Please find your invoice below.</p>
        <table border="1" cellpadding="8" cellspacing="0">
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        """.formatted(
                invoice.getCustomer().getName(),
                invoice.getCustomer().getSurname()
        ));

        for (InvoiceItemEntity item : invoice.getItems()) {
            sb.append("""
            <tr>
                <td>%s</td>
                <td>%d</td>
                <td>$%.2f</td>
                <td>$%.2f</td>
            </tr>
            """.formatted(
                    item.getProduct().getProductName(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice()
            ));
        }

        sb.append("""
            <tr>
                <td colspan="3"><strong>Grand Total</strong></td>
                <td><strong>$%.2f</strong></td>
            </tr>
        </table>
        <p>Date: %s</p>
        <br>
        <p>Best regards.</p>
        </body></html>
        """.formatted(invoice.getTotalPrice(), invoice.getDate()));

        return sb.toString();
    }

    private String buildRefundHtml(RefundEmailDetails refund) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
        <html><body>
        <h2>Your refund has been accepted</h2>
        <p>Dear <strong>%s %s</strong>,</p>
        <p>The following products from invoice <strong>#%s</strong> have been refunded.</p>
        <table border="1" cellpadding="8" cellspacing="0">
            <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        """.formatted(
                refund.customerName(),
                refund.customerSurname() == null ? "" : refund.customerSurname(),
                refund.invoiceId()
        ));

        for (RefundEmailDetails.RefundedItem item : refund.items()) {
            sb.append("""
            <tr>
                <td>%s</td>
                <td>%d</td>
                <td>$%.2f</td>
                <td>$%.2f</td>
            </tr>
            """.formatted(
                    item.productName(),
                    item.quantity(),
                    item.unitPrice(),
                    item.totalPrice()
            ));
        }

        sb.append("""
            <tr>
                <td colspan="3"><strong>Refund Total</strong></td>
                <td><strong>$%.2f</strong></td>
            </tr>
        </table>
        <p>Refund date: %s</p>
        <br>
        <p>Best regards.</p>
        </body></html>
        """.formatted(refund.refundAmount(), refund.date()));

        return sb.toString();
    }
}
