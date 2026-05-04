package com.backend.backend.service;
import com.backend.backend.api.dto.DeliveryDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.persistence.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
@Service
public class DeliveryService {
    private final DeliveryRepository deliveryRepository;
    public DeliveryService(DeliveryRepository deliveryRepository) {
        this.deliveryRepository = deliveryRepository;
    }
    public List<DeliveryDTO> getDeliveriesByUser(UUID userId) {
        return deliveryRepository.findByCustomerId(userId).stream()
            .map(delivery -> new DeliveryDTO(
                delivery.getId(),
                delivery.getCustomer().getId(),
                delivery.getInvoice().getItems().stream()
                    .map(item -> new InvoiceItemDTO(
                        item.getProduct().getId(),
                        item.getProduct().getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                    ))
                    .collect(Collectors.toList()),
                delivery.getInvoice().getTotalPrice(),
                delivery.getAddress(),
                null,
                delivery.isCompleted(),
                delivery.getStatus()
            ))
            .collect(Collectors.toList());
    }
}