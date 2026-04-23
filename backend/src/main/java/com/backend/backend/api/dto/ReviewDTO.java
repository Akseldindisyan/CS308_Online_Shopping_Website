package com.backend.backend.api.dto;

import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;

public record ReviewDTO(
        int rating,
        ProductEntity product,
        UserEntity user,
        java.time.LocalDate createdAt
) {
}
