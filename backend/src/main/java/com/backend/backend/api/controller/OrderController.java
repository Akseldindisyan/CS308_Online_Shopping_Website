package com.backend.backend.api.controller;
import com.backend.backend.api.dto.InvoiceDTO;
import com.backend.backend.security.AppUserPrincipal;
import com.backend.backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public List<InvoiceDTO> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{userId}")
    public List<InvoiceDTO> getOrders(@PathVariable UUID userId) {
        return orderService.getOrdersByUser(userId);
    }

    @PatchMapping("/{invoiceId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('CUSTOMER')")
    public void cancelOrder(
            @PathVariable UUID invoiceId,
            @AuthenticationPrincipal AppUserPrincipal principal) {
        orderService.cancelOrder(invoiceId, principal.getUserId());
    }
}
