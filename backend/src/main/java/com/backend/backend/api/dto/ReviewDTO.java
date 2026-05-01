package com.backend.backend.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ReviewDTO(
        @Min(1)
        @Max(10)
        double rating,
        ProductCardDTO product,
        UserDTO user,
        java.time.LocalDate createdAt
) {
}
