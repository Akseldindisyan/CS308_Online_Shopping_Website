package com.backend.backend.persistence.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "product")
public class ProductEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    @Column(name = "product_id")
    private UUID id;
    @Column(name = "product_name")
    private String productName;
    private double rating;
    private int stock;
    private String model;
    private String serialNumber;
    @Column(name = "description")
    private String desc;
    private double price;
    @Column(name = "distributor_info")
    private String distInfo;
    @Column(name = "country_of_origin")
    private String country;

    protected ProductEntity() {}

    public ProductEntity(String productName, double rating, int stock, String model, String serialNumber, String desc, double price, String distInfo, String country){
        this.productName = productName;
        this.rating = rating;
        this.stock = stock;
        this.model = model;
        this.serialNumber = serialNumber;
        this.desc = desc;
        this.price = price;
        this.distInfo = distInfo;
        this.country = country;
    }
    
    @Override
    public String toString() {
        return String.format(
                "Product[id=%s, productName='%s', rating='%.2f', stock='%d', model='%s', serialNumber='%s', desc='%s', price='%.2f', distInfo = '%s', country = '%s']",
                id, productName, rating, stock, model, serialNumber, desc, price, distInfo, country);
    }

    public UUID getId(){
        return id;
    }

    public String getProductName(){
        return productName;
    }

    public double getRating(){
        return rating;
    }

    public int getStock(){
        return stock;
    }

    public String getModel(){
        return model;
    }

    public String getSerialNumber(){
        return serialNumber;
    }

    public String getDesc(){
        return desc;
    }

    public double getPrice(){
        return price;
    }

    public String getDistInfo(){
        return distInfo;
    }

    public String getCountry(){
        return country;
    }

    public void setStock(int amount){
        this.stock = amount;
    }

}
