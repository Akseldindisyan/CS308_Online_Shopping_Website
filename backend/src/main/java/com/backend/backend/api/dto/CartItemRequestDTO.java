package com.backend.backend.api.dto;

import java.util.UUID;

public record CartItemRequestDTO(
        UUID productId,
        int quantity
) {}

