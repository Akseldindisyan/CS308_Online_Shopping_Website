package com.backend.backend.api.dto;

public record CommentDTO(
        String token,
        String productId,
        String comment,
        double rating,
        String commentDate
) {
}
