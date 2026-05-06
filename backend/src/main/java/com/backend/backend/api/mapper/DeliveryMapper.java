package com.backend.backend.api.mapper;

import com.backend.backend.api.dto.DeliveryDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.persistence.entity.DeliveryEntity;
import com.backend.backend.persistence.entity.InvoiceEntity;

import java.util.List;

public class DeliveryMapper {
    public static DeliveryDTO toDTO(DeliveryEntity entity) {
        InvoiceEntity invoice = entity.getInvoice();

        List<InvoiceItemDTO> items = invoice.getItems().stream()
                .map(item -> new InvoiceItemDTO(
                        item.getProduct().getId(),
                        item.getProduct().getProductName(),
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getTotalPrice()
                ))
                .toList();

        return new DeliveryDTO(
                entity.getId(),
                entity.getCustomer().getId(),
                items,
                invoice.getTotalPrice(),
                entity.getAddress(),
                "",
                entity.isCompleted(),
                entity.getStatus()
        );
    }
}