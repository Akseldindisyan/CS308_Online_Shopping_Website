package com.backend.backend.api.dto;

import java.util.List;
import java.util.UUID;

public record SalesInvoiceDTO(
        UUID invoiceId,
        UUID customerId,
        String customerName,
        String date,
        double totalPrice,
        List<InvoiceItemDTO> items
) {}
