package com.backend.backend.service;
import com.backend.backend.api.exception.ConflictException;
import com.backend.backend.api.exception.ForbiddenOperationException;
import com.backend.backend.api.exception.ResourceNotFoundException;
import com.backend.backend.api.dto.InvoiceDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.persistence.entity.DeliveryEntity;
import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.repository.DeliveryRepository;
import com.backend.backend.persistence.repository.InvoiceRepository;
import com.backend.backend.persistence.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class OrderService {
    private final InvoiceRepository invoiceRepository;
    private final DeliveryRepository deliveryRepository;
    private final ProductRepository productRepository;

    public OrderService(
            InvoiceRepository invoiceRepository,
            DeliveryRepository deliveryRepository,
            ProductRepository productRepository) {
        this.invoiceRepository = invoiceRepository;
        this.deliveryRepository = deliveryRepository;
        this.productRepository = productRepository;
    }

    private InvoiceDTO toDTO(InvoiceEntity invoice) {
        String status = deliveryRepository.findByInvoice_Id(invoice.getId())
                .map(d -> d.getStatus())
                .orElse("PENDING");
        return new InvoiceDTO(
                invoice.getId(),
                invoice.getCustomer().getId(),
                invoice.getItems().stream()
                        .map(item -> new InvoiceItemDTO(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getProductName(),
                                item.getQuantity(),
                                item.getUnitPrice(),
                                item.getTotalPrice()
                        ))
                        .collect(Collectors.toList()),
                invoice.getTotalPrice(),
                invoice.getDate() != null ? invoice.getDate().toString() : null,
                status
        );
    }

    public List<InvoiceDTO> getAllOrders() {
        return invoiceRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<InvoiceDTO> getOrdersByUser(UUID userId) {
        return invoiceRepository.findByCustomerId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelOrder(UUID invoiceId, UUID userId) {
        InvoiceEntity invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ORDER_NOT_FOUND",
                        "Order not found"));

        if (invoice.getCustomer() == null || !invoice.getCustomer().getId().equals(userId)) {
            throw new ForbiddenOperationException(
                    "ORDER_ACCESS_DENIED",
                    "This order does not belong to the authenticated customer");
        }

        DeliveryEntity delivery = deliveryRepository.findByInvoice_Id(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "DELIVERY_NOT_FOUND",
                        "Delivery record not found for this order"));

        String status = delivery.getStatus() == null ? "" : delivery.getStatus().trim();
        if ("CANCELLED".equalsIgnoreCase(status) || "CANCELED".equalsIgnoreCase(status)) {
            throw new ConflictException("ORDER_ALREADY_CANCELLED", "Order is already cancelled");
        }
        if ("DELIVERED".equalsIgnoreCase(status) || "COMPLETED".equalsIgnoreCase(status)) {
            throw new ConflictException(
                    "DELIVERED_ORDER_CANNOT_BE_CANCELLED",
                    "Delivered orders cannot be cancelled; request a refund instead");
        }

        invoice.getItems().forEach(item -> {
            if (item.getProduct() != null) {
                item.getProduct().setStock(item.getProduct().getStock() + item.getQuantity());
                productRepository.save(item.getProduct());
            }
        });

        delivery.setStatus("CANCELLED");
        delivery.setCompleted(false);
        deliveryRepository.save(delivery);
    }
}
