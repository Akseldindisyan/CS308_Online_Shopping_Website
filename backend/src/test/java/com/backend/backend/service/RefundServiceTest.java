package com.backend.backend.service;

import com.backend.backend.api.exception.BadRequestException;
import com.backend.backend.persistence.entity.*;
import com.backend.backend.persistence.repository.InvoiceItemRepository;
import com.backend.backend.persistence.repository.InvoiceRepository;
import com.backend.backend.persistence.repository.RefundRequestRepository;
import com.backend.backend.persistence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RefundServiceTest {

    @Mock
    private RefundRequestRepository refundRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private InvoiceItemRepository invoiceItemRepository;

    @InjectMocks
    private RefundService refundService;

    private UserEntity user;
    private InvoiceEntity invoice;
    private InvoiceItemEntity item;
    private RefundRequestEntity refundRequest;
    private UUID userId, invoiceId, itemId, refundId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        invoiceId = UUID.randomUUID();
        itemId = UUID.randomUUID();
        refundId = UUID.randomUUID();

        user = new UserEntity();
        user.setId(userId);

        invoice = new InvoiceEntity();
        invoice.setId(invoiceId);
        invoice.setCustomer(user);
        invoice.setTotalPrice(500.0);
        invoice.setDate(Date.from(Instant.now().minus(10, ChronoUnit.DAYS)));

        item = new InvoiceItemEntity();
        item.setId(itemId);
        item.setTotalPrice(50.0);
        item.setInvoice(invoice);

        refundRequest = new RefundRequestEntity();
        refundRequest.setId(refundId);
        refundRequest.setCustomer(user);
        refundRequest.setInvoice(invoice);
        refundRequest.setStatus(RefundStatus.UNDECIDED);

        List<InvoiceItemEntity> items = new ArrayList<>();
        items.add(item);
        refundRequest.setItems(items);
    }

    @Test
    void createRefundRequestSuccess() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(invoiceItemRepository.findAllById(List.of(itemId))).thenReturn(List.of(item));
        when(refundRepository.save(any(RefundRequestEntity.class))).thenReturn(refundRequest);

        RefundRequestEntity created = refundService.createRefundRequest(userId, invoiceId, List.of(itemId));

        assertEquals(RefundStatus.UNDECIDED, created.getStatus());
        verify(refundRepository).save(any(RefundRequestEntity.class));
    }

    @Test
    void createRefundRequestRejectsInvoiceOlderThanThirtyDays() {
        invoice.setDate(Date.from(Instant.now().minus(31, ChronoUnit.DAYS)));
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> refundService.createRefundRequest(userId, invoiceId, List.of(itemId)));

        assertEquals("REFUND_WINDOW_EXPIRED", exception.getCode());
        verifyNoInteractions(invoiceItemRepository);
        verify(refundRepository, never()).save(any());
    }

    @Test
    void acceptRefundSuccessUpdatesInvoiceTotal() {
        when(refundRepository.findById(refundId)).thenReturn(Optional.of(refundRequest));

        refundService.acceptRefund(refundId);

        assertEquals(450.0, invoice.getTotalPrice());
        assertEquals(RefundStatus.ACCEPTED, refundRequest.getStatus());

        verify(invoiceItemRepository).deleteAllInBatch(anyList());
        verify(invoiceRepository).save(invoice);
        verify(refundRepository).save(refundRequest);
    }

    @Test
    void rejectRefundSuccess() {
        when(refundRepository.findById(refundId)).thenReturn(Optional.of(refundRequest));

        refundService.rejectRefund(refundId);

        assertEquals(RefundStatus.REJECTED, refundRequest.getStatus());
        verify(refundRepository).save(refundRequest);
    }
}
