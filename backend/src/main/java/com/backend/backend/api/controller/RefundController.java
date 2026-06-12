package com.backend.backend.api.controller;

import com.backend.backend.api.dto.CreateRefundRequestDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.api.dto.RefundResponseDTO;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.entity.RefundRequestEntity;
import com.backend.backend.service.InvoiceEmailService;
import com.backend.backend.service.RefundEmailDetails;
import com.backend.backend.service.RefundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.backend.backend.security.AppUserPrincipal;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Validated
public class RefundController {

    @Autowired
    private RefundService refundService;

    @Autowired
    private InvoiceEmailService invoiceEmailService;

    @PostMapping("/refunds")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CUSTOMER')")
    public RefundResponseDTO createRefundRequest(
            @AuthenticationPrincipal AppUserPrincipal principal,
            @RequestBody CreateRefundRequestDTO requestDTO) {
        var entity = refundService.createRefundRequest(
                principal.getUserId(),
                requestDTO.getInvoiceId(),
                requestDTO.getItemIdsToRefund()
        );
        return mapToResponseDTO(entity);
    }

    @GetMapping("/refunds/mine")
    @PreAuthorize("hasRole('CUSTOMER')")
    public List<RefundResponseDTO> getMyRefundRequests(
            @AuthenticationPrincipal AppUserPrincipal principal) {
        return refundService.getRefundsByUser(principal.getUserId()).stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @PatchMapping("/refunds/{refundId}/accept")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SALES_MANAGER')")
    public void acceptRefund(@PathVariable UUID refundId) {
        RefundEmailDetails emailDetails = refundService.acceptRefund(refundId);
        invoiceEmailService.sendRefundEmail(emailDetails);
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
        dto.setInvoiceId(entity.getInvoice().getId());
        dto.setStatus(entity.getStatus().name());
        dto.setDate(entity.getDate());
        dto.setRefundAmount(entity.getRefundAmount());

        String customerFullName = entity.getCustomer().getName();
        if (entity.getCustomer().getSurname() != null) {
            customerFullName += " " + entity.getCustomer().getSurname();
        }
        dto.setCustomerName(customerFullName);

        if (entity.getItems() != null) {
            List<InvoiceItemDTO> items = entity.getItems().stream()
                    .map(item -> new InvoiceItemDTO(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getProductName(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            item.getTotalPrice()
                    ))
                    .collect(Collectors.toList());
            dto.setItems(items);
        }

        return dto;
    }
}
