package com.backend.backend.api.dto;

import java.util.List;
import java.util.UUID;

public record CartDTO(
        UUID cartId,
        UUID userId,
        String guestToken,
        boolean guestCart,
        boolean canCheckout,
        List<CartItemDTO> items,
        double totalPrice) {
}

