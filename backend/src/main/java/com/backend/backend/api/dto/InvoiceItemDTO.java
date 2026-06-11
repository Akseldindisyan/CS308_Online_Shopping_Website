package com.backend.backend.api.dto;

import java.util.UUID;

public record InvoiceItemDTO(
        UUID invoiceItemId,
        UUID productId,
        String productName,
        Integer quantity,
        Double unitPrice,
        Double totalPrice
) {}
