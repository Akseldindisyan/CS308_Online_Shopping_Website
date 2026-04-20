package com.backend.backend.api.mapper;

import com.backend.backend.api.dto.WishlistDTO;
import com.backend.backend.persistence.entity.ProductEntity;

public class WishlistMapper {

    public static WishlistDTO toDTO(ProductEntity product) {
        WishlistDTO dto = new WishlistDTO();
        dto.setProductId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setActive(product.getStock() > 0);
        return dto;
    }
}