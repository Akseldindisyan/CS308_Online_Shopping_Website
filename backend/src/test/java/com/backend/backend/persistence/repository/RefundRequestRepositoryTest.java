package com.backend.backend.persistence.repository;

//Import classes
import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.RefundRequestEntity;
import com.backend.backend.persistence.entity.RefundStatus;
import com.backend.backend.persistence.entity.UserEntity;

//Import basic structures
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

//Import Test libraries
import org.junit.jupiter.api.*;

import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class RefundRequestRepositoryTest {

    @Autowired
    RefundRequestRepository refundRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    InvoiceRepository invoiceRepository;

    private UUID testRefundId;

    //Functions to automate testing
    @BeforeEach
    void initializeMockupDatabase() {
        // Create Mock User (Required for Foreign Key)
        UserEntity user = new UserEntity();
        user.setName("John");
        user.setSurname("Doe");
        user.setEmail("johndoe_refundtest@example.com");
        user.setPassword("password123");
        user.setRole(UserEntity.Role.CUSTOMER);
        user = userRepository.save(user);

        // Create Mock Invoice (Required for Foreign Key)
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setCustomer(user);
        invoice.setTotalPrice(500.0);
        invoice = invoiceRepository.save(invoice);

        // Create Refund Request 1 (UNDECIDED)
        RefundRequestEntity refund1 = new RefundRequestEntity();
        refund1.setCustomer(user);
        refund1.setInvoice(invoice);
        refund1.setStatus(RefundStatus.UNDECIDED);
        refund1.setItems(new ArrayList<>());
        refund1 = refundRepository.save(refund1);

        testRefundId = refund1.getId();

        // Create Refund Request 2 (ACCEPTED)
        RefundRequestEntity refund2 = new RefundRequestEntity();
        refund2.setCustomer(user);
        refund2.setInvoice(invoice);
        refund2.setStatus(RefundStatus.ACCEPTED);
        refund2.setItems(new ArrayList<>());
        refundRepository.save(refund2);
    }

    //Cleans the database
    @AfterEach
    void cleanUpDatabase() {
        refundRepository.deleteAll();
        invoiceRepository.deleteAll();
        userRepository.deleteAll();
    }

    //Tests
    @Test
    void findRefundByIdNotAvailableTest() {
        System.out.println("Try to find a refund request with non existing id");

        //Extract its id for search in the database
        UUID id = UUID.randomUUID();
        Optional<RefundRequestEntity> result = refundRepository.findById(id);

        //Check whether it is present
        assertTrue(result.isEmpty());
    }

    @Test
    void findRefundByIdRegularTest() {
        System.out.println("Try to find a refund request with id");

        Optional<RefundRequestEntity> result = refundRepository.findById(testRefundId);

        //Check whether it is present
        assertTrue(result.isPresent());

        //Compare Expected and Result
        assertEquals(testRefundId, result.get().getId());
        assertEquals(RefundStatus.UNDECIDED, result.get().getStatus());
    }

    @Test
    void findAllRefundsRegularTest() {
        System.out.println("Try to find all refund requests");

        List<RefundRequestEntity> result = refundRepository.findAll();

        assertFalse(result.isEmpty());
        assertEquals(2, result.size());
    }
}