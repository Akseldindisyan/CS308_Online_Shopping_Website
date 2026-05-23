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
    private UUID customerId;
    private UUID invoiceId;
    private List<UUID> itemIds;
    private String status;
    private Date date;
}