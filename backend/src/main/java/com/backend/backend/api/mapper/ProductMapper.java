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
        dto.setActive(entity.getStock() > 0);
        dto.setCategory(entity.getCategory());
        dto.setImageUrl(null);
        dto.setRating(entity.getRating());
        return dto;
    }

    public static ProductDetailedDTO toDetailedDTO(ProductEntity entity) {
        ProductDetailedDTO dto = new ProductDetailedDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getProductName());
        dto.setModel(entity.getModel());
        dto.setSerialNumber(entity.getSerialNumber());
        dto.setPrice(entity.getPrice());
        dto.setRating(entity.getRating());
        dto.setStock(entity.getStock());
        dto.setDescription(entity.getDesc());
        dto.setDistributorName(entity.getDistInfo());

        dto.setCategory(null);
        dto.setImage(null);
        dto.setExtraImages(Collections.emptyList());
        dto.setFeatures(Collections.emptyList());
        dto.setWarrantyStatus(null);
        dto.setDistributorContact(null);
        dto.setDistributorAddress(null);
        dto.setDistributorEmail(null);
        return dto;
    }
}