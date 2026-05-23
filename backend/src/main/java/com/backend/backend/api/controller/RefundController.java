package com.backend.backend.api.controller;

import com.backend.backend.api.dto.CreateRefundRequestDTO;
import com.backend.backend.api.dto.RefundResponseDTO;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.entity.RefundRequestEntity;
import com.backend.backend.service.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Validated
public class RefundController {

    @Autowired
    private RefundService refundService;

    @PostMapping("/refunds")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public RefundResponseDTO createRefundRequest(@RequestBody CreateRefundRequestDTO requestDTO) {
        var entity = refundService.createRefundRequest(
                requestDTO.getUserId(),
                requestDTO.getInvoiceId(),
                requestDTO.getItemIdsToRefund()
        );
        return mapToResponseDTO(entity);
    }

    @PatchMapping("/refunds/{refundId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SALES_MANAGER')")
    public void acceptRefund(@PathVariable UUID refundId) {
        refundService.acceptRefund(refundId);
    }

    @PatchMapping("/refunds/{refundId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SALES_MANAGER')")
    public void rejectRefund(@PathVariable UUID refundId) {
        refundService.rejectRefund(refundId);
    }

    private RefundResponseDTO mapToResponseDTO(RefundRequestEntity entity) {
        RefundResponseDTO dto = new RefundResponseDTO();
        dto.setRefundId(entity.getId());
        dto.setCustomerId(entity.getCustomer().getId());
        dto.setInvoiceId(entity.getInvoice().getId());
        dto.setStatus(entity.getStatus().name());
        dto.setDate(entity.getDate());

        if (entity.getItems() != null) {
            List<UUID> itemIds = entity.getItems().stream()
                    .map(InvoiceItemEntity::getId)
                    .collect(Collectors.toList());
            dto.setItemIds(itemIds);
        }

        return dto;
    }
}