package com.backend.backend.api.dto;

public record CreateProductRequest(
        String productName,
        double price,
        int stock,
        String category,
        String model,
        String serialNumber,
        String desc,
        String distInfo,
        String country,
        String imageUrl,
        boolean active,
        String warrantyStatus
) {}
