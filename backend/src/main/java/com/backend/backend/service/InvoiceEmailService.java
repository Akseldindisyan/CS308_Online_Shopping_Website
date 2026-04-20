package com.backend.backend.service;

import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


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
            helper.setSubject("Siparişiniz Alındı - Fatura #" + invoice.getId());
            helper.setText(buildHtml(invoice), true);
            mailSender.send(message);
        } catch (MessagingException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Fatura e-postası gönderilemedi"
            );
        }
    }

    private String buildHtml(InvoiceEntity invoice) {
        StringBuilder sb = new StringBuilder();
        sb.append("""
            <html><body>
            <h2>Siparişiniz için teşekkürler!</h2>
            <p>Sayın <strong>%s %s</strong>,</p>
            <p>Aşağıda sipariş faturanızı bulabilirsiniz.</p>
            <table border="1" cellpadding="8" cellspacing="0">
                <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Birim Fiyat</th>
                    <th>Toplam</th>
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
                    <td>%.2f TL</td>
                    <td>%.2f TL</td>
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
                    <td colspan="3"><strong>Genel Toplam</strong></td>
                    <td><strong>%.2f TL</strong></td>
                </tr>
            </table>
            <p>Tarih: %s</p>
            <br>
            <p>İyi günler dileriz.</p>
            </body></html>
            """.formatted(invoice.getTotalPrice(), invoice.getDate()));

        return sb.toString();
    }
}