package com.backend.backend.persistence.entity;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ProductEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
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

    public UUID getID(){
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

}
