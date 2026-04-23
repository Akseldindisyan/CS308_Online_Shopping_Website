package com.backend.backend.service;

import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.test.context.ActiveProfiles;

import java.util.Date;
import java.util.List;
import java.util.Properties;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
@SpringBootTest
@ActiveProfiles("test")
class InvoiceEmailServiceIntegrationTest {

    static GreenMail greenMail;
    private InvoiceEmailService invoiceEmailService;

    @BeforeAll
    static void startMailServer() {
        greenMail = new GreenMail(ServerSetupTest.SMTP);
        greenMail.start();
    }

    @AfterAll
    static void stopMailServer() {
        greenMail.stop();
    }

    @BeforeEach
    void setUp() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("localhost");
        sender.setPort(3025);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");

        invoiceEmailService = new InvoiceEmailService(sender);
        greenMail.reset();
    }

    @Test
    void shouldDeliverInvoiceEmail() throws Exception {
        InvoiceEntity invoice = buildTestInvoice();

        invoiceEmailService.sendInvoiceEmail(invoice);

        MimeMessage[] received = greenMail.getReceivedMessages();
        assertThat(received).hasSize(1);
        assertThat(received[0].getSubject()).contains("Fatura");
        assertThat(received[0].getAllRecipients()[0].toString())
                .isEqualTo("musteri@test.com");
    }

    private InvoiceEntity buildTestInvoice() {
        UserEntity customer = new UserEntity();
        customer.setName("Ahmet");
        customer.setSurname("Yılmaz");
        customer.setEmail("musteri@test.com");

        ProductEntity product = new ProductEntity(
                "Laptop", 0.0, 1, "model", "SN123", "desc", 15000.0, "dist", "TR"
        );

        InvoiceItemEntity item = new InvoiceItemEntity();
        item.setProduct(product);
        item.setQuantity(1);
        item.setUnitPrice(15000.0);
        item.setTotalPrice(15000.0);

        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(UUID.randomUUID());
        invoice.setCustomer(customer);
        invoice.setItems(List.of(item));
        invoice.setTotalPrice(15000.0);
        invoice.setDate(new Date());

        return invoice;
    }
}