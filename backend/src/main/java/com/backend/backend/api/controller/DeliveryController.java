package com.backend.backend.api.controller;
import com.backend.backend.api.dto.DeliveryDTO;
import com.backend.backend.api.dto.UpdateDeliveryStatusRequest;
import com.backend.backend.service.DeliveryService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {
    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public List<DeliveryDTO> getDeliveriesByUser(@PathVariable UUID userId) {
        return deliveryService.getDeliveriesByUser(userId);
    }

    @GetMapping
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public List<DeliveryDTO> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @PatchMapping("/{deliveryId}/status")
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public DeliveryDTO updateDeliveryStatus(
            @PathVariable UUID deliveryId,
            @RequestBody UpdateDeliveryStatusRequest request) {
        return deliveryService.updateStatus(deliveryId, request.status());
    }
}