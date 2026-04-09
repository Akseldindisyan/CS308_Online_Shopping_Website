package com.backend.backend.api.dto;

import java.util.UUID;

public record CartItemDTO(
        UUID productId,
        String productName,
        double unitPrice,
        int quantity,
        double lineTotal) {
}

