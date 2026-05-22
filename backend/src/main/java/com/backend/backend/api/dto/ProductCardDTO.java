package com.backend.backend.api.dto;

import java.util.UUID;

import lombok.*;


@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class ProductCardDTO {
    private UUID id;
    private String name;
    private String category;
    private Double price;
    private Integer stock;
    private Boolean active;
    private String imageUrl;
    private Double rating;
    private Double discountRate;
}