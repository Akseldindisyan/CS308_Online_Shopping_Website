package com.backend.backend.api.dto;

import java.util.UUID;

public record InvoiceItemDTO(
        UUID productId,
        Integer quantity,
        Double unitPrice,
        Double totalPrice
) {}