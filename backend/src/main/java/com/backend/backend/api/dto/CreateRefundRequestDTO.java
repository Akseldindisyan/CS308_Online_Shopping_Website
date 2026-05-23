package com.backend.backend.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
public class CreateRefundRequestDTO {
    private UUID userId;
    private UUID invoiceId;
    private List<UUID> itemIdsToRefund;
}
