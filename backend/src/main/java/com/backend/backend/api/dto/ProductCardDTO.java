package com.backend.backend.api.dto;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Getter
@Setter
public class ProductCardDTO {
    private UUID id;
    private String name;
    private String category;
    private Double price;
    private Integer stock;
    private Boolean active;
    private String imageUrl;
    private Double rating;

    public ProductCardDTO(UUID id, String name, String category, Double price, Integer stock, Boolean active, String imageUrl, Double rating) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.stock = stock;
        this.active = active;
        this.imageUrl = imageUrl;
        this.rating = rating;
    }
}