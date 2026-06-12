package com.backend.backend.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class RefundResponseDTO {
    private UUID refundId;
    private String customerName;
    private UUID invoiceId;
    private List<InvoiceItemDTO> items;
    private String status;
    private Date date;
    private double refundAmount;
}
