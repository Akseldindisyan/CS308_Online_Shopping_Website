package com.backend.backend.persistence.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "product")
public class ProductEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name = "product_id")
    private UUID id;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "rating")
    private double rating;

    @Column(name = "stock")
    private int stock;

    @Column(name = "model")
    private String model;

    @Column(name = "serial_number")
    private String serialNumber;

    @Column(name = "description")
    private String desc;

    @Column(name = "price")
    private double price;

    @Column(name = "distributor_info")
    private String distInfo;

    @Column(name = "country_of_origin")
    private String country;

    @Column(name = "category")
    private String category;

    @Column(name = "image_url")
    private String image_url;

    public ProductEntity(String productName, double rating, int stock, String model, String serialNumber, String desc, double price, String distInfo, String country, String Category, String image_url){
        this.productName = productName;
        this.rating = rating;
        this.stock = stock;
        this.model = model;
        this.serialNumber = serialNumber;
        this.desc = desc;
        this.price = price;
        this.distInfo = distInfo;
        this.country = country;
        this.category = category;
        this.image_url = image_url;
    }
}
