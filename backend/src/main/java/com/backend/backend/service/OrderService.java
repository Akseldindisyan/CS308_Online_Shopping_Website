package com.backend.backend.service;
import com.backend.backend.api.dto.InvoiceDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.repository.DeliveryRepository;
import com.backend.backend.persistence.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class OrderService {
    private final InvoiceRepository invoiceRepository;
    private final DeliveryRepository deliveryRepository;

    public OrderService(InvoiceRepository invoiceRepository, DeliveryRepository deliveryRepository) {
        this.invoiceRepository = invoiceRepository;
        this.deliveryRepository = deliveryRepository;
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
}
