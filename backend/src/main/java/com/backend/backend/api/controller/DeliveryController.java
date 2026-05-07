package com.backend.backend.api.controller;
import com.backend.backend.api.dto.DeliveryDTO;
import com.backend.backend.service.DeliveryService;
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
    public List<DeliveryDTO> getDeliveriesByUser(@PathVariable UUID userId) {
        return deliveryService.getDeliveriesByUser(userId);
    }
}