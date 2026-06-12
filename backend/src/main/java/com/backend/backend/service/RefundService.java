package com.backend.backend.service;

import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.entity.RefundRequestEntity;
import com.backend.backend.persistence.entity.RefundStatus;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.InvoiceItemRepository;
import com.backend.backend.persistence.repository.InvoiceRepository;
import com.backend.backend.persistence.repository.RefundRequestRepository;
import com.backend.backend.persistence.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Date;
import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRequestRepository refundRepository;
    private final UserRepository userRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;

    @Transactional
    public RefundRequestEntity createRefundRequest(UUID userId, UUID invoiceId, List<UUID> itemIdsToRefund) {
        if (itemIdsToRefund == null || itemIdsToRefund.isEmpty()) {
            throw new IllegalArgumentException("At least one invoice item must be selected");
        }

        UserEntity customer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (!invoice.getCustomer().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Invoice does not belong to this user.");
        }

        List<InvoiceItemEntity> items = invoiceItemRepository.findAllById(itemIdsToRefund);
        if (items.size() != new HashSet<>(itemIdsToRefund).size()) {
            throw new IllegalArgumentException("One or more invoice items were not found");
        }

        for (InvoiceItemEntity item : items) {
            if (!item.getInvoice().getId().equals(invoiceId)) {
                throw new RuntimeException("Invalid item: Item " + item.getId() + " does not belong to this invoice.");
            }
            if (refundRepository.existsByStatusAndItemsId(RefundStatus.UNDECIDED, item.getId())) {
                throw new IllegalStateException("A refund request is already pending for this order");
            }
        }

        RefundRequestEntity refundRequest = new RefundRequestEntity();
        refundRequest.setCustomer(customer);
        refundRequest.setInvoice(invoice);
        refundRequest.setItems(items);
        refundRequest.setDate(new Date());

        return refundRepository.save(refundRequest);
    }

    public List<RefundRequestEntity> getRefundsByUser(UUID userId) {
        return refundRepository.findByCustomerId(userId);
    }

    @Transactional
    public void acceptRefund(UUID refundId) {
        RefundRequestEntity refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        if (refund.getStatus() != RefundStatus.UNDECIDED) {
            throw new IllegalStateException("Refund is not in UNDECIDED status");
        }

        InvoiceEntity invoice = refund.getInvoice();
        List<InvoiceItemEntity> itemsToRefund = refund.getItems();

        double refundAmount = 0.0;
        for (InvoiceItemEntity item : itemsToRefund) {
            refundAmount += item.getTotalPrice();
        }
        refund.setRefundAmount(refundAmount);

        double currentTotal = invoice.getTotalPrice();
        invoice.setTotalPrice(currentTotal - refundAmount);

        invoiceItemRepository.deleteAllInBatch(itemsToRefund);
        refund.getItems().clear();

        refund.setStatus(RefundStatus.ACCEPTED);

        invoiceRepository.save(invoice);
        refundRepository.save(refund);
    }

    @Transactional
    public void rejectRefund(UUID refundId) {
        RefundRequestEntity refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new RuntimeException("Refund not found"));

        if (refund.getStatus() != RefundStatus.UNDECIDED) {
            throw new IllegalStateException("Refund is not in UNDECIDED status");
        }

        refund.setStatus(RefundStatus.REJECTED);
        refundRepository.save(refund);
    }

    public RefundRequestEntity getRefund(UUID refundID){
        RefundRequestEntity refund = refundRepository.findById(refundID)
                .orElseThrow(() -> new RuntimeException("Refund not found"));
        return refund;
    }

    public List<RefundRequestEntity> getRefundsByStatus(RefundStatus status) {
        return refundRepository.findByStatusOrderByDateDesc(status);
    }
}