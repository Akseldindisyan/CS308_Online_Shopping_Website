package com.backend.backend.api.mapper;

import com.backend.backend.api.dto.ProductCardDTO;
import com.backend.backend.api.dto.ProductDetailedDTO;
import com.backend.backend.persistence.entity.ProductEntity;

import java.util.Collections;

public class ProductMapper {

    public static ProductCardDTO toCardDTO(ProductEntity entity) {
        ProductCardDTO dto = new ProductCardDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getProductName());
        dto.setPrice(entity.getPrice());
        dto.setStock(entity.getStock());
        dto.setActive(entity.isActive());
        dto.setCategory(entity.getCategory());
        dto.setImageUrl(entity.getImage_url());
        dto.setRating(entity.getRating());
        dto.setDiscountRate(entity.getDiscountRate());
        return dto;
    }

    public static ProductDetailedDTO toDetailedDTO(ProductEntity entity) {
        ProductDetailedDTO dto = new ProductDetailedDTO();
        dto.setId(entity.getId());
        dto.setCountry(entity.getCountry());
        dto.setProductName(entity.getProductName());
        dto.setModel(entity.getModel());
        dto.setSerialNumber(entity.getSerialNumber());
        dto.setPrice(entity.getPrice());
        dto.setRating(entity.getRating());
        dto.setStock(entity.getStock());
        dto.setDesc(entity.getDesc());
        dto.setDistInfo(entity.getDistInfo());
        dto.setCategory(entity.getCategory());
        dto.setImage_url(entity.getImage_url());
        dto.setWarranty_status(entity.getWarranty_status());
        dto.setDiscountRate(entity.getDiscountRate());
        return dto;
    }
}