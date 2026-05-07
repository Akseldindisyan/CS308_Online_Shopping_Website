package com.backend.backend.api.dto;

import com.backend.backend.persistence.entity.ReviewEntity;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.*;

public record ReviewDTO(
        @Min(1)
        @Max(5)
        double rating,
        UUID id,
        String username,
        String comment,
        java.time.LocalDate createdAt,
        UUID product_id,
        String product_name,
        boolean approved
) {
}