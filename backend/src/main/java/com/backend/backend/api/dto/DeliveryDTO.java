package com.backend.backend.api.dto;

import com.backend.backend.api.dto.InvoiceItemDTO;

import java.util.List;
import java.util.UUID;

public record DeliveryDTO(
        UUID deliveryId,
        UUID customerId,
        List<InvoiceItemDTO> items,
        double totalPrice,
        String address,
        String addressDetail,
        boolean completed,
        String status
) {}