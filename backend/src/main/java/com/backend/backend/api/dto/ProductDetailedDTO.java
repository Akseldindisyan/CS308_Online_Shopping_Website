package com.backend.backend.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;
import java.util.List;


@NoArgsConstructor
@Getter
@Setter
@AllArgsConstructor
public class ProductDetailedDTO {
    private UUID id;
    private String productName;
    private double rating;
    private int stock;
    private String model;
    private String serialNumber;
    private String desc;
    private double price;
    private String distInfo;
    private String country;
    private String category;
    private String image_url;
    private boolean active;
    private String warranty_status;
}