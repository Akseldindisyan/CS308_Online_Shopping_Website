package com.backend.backend.api.dto;

import java.util.List;
import java.util.UUID;

public record InvoiceDTO(
        UUID invoiceId,
        UUID customerId,
        List<InvoiceItemDTO> items,
        Double totalPrice,
        String date
) {}