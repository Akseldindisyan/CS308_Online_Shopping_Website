package com.backend.backend.api.dto;

import java.util.UUID;

public class DeliveryDTO {
    private UUID deliveryId;
    private UUID customerId;
    private Long productId;
    private Integer quantity;
    private Double totalPrice;
    private String address;
    private String addressDetail;
    private Boolean completed;
    private String status;

    public DeliveryDTO() {}

    public DeliveryDTO(UUID deliveryId, UUID customerId, Long productId, Integer quantity, 
                       Double totalPrice, String address, String addressDetail, 
                       Boolean completed, String status) {
        this.deliveryId = deliveryId;
        this.customerId = customerId;
        this.productId = productId;
        this.quantity = quantity;
        this.totalPrice = totalPrice;
        this.address = address;
        this.addressDetail = addressDetail;
        this.completed = completed;
        this.status = status;
    }

    public UUID getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(UUID deliveryId) {
        this.deliveryId = deliveryId;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAddressDetail() {
        return addressDetail;
    }

    public void setAddressDetail(String addressDetail) {
        this.addressDetail = addressDetail;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}