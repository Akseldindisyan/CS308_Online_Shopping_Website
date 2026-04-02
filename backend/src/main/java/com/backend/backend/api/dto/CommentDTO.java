package com.backend.backend.api.dto;

import java.util.UUID;

public class CommentDTO {
    private UUID id;
    private Long productId;
    private String author;
    private String text;
    private Integer rating;
    private String status;
    private String date;

    public CommentDTO() {}

    public CommentDTO(UUID id, Long productId, String author, String text, 
                      Integer rating, String status, String date) {
        this.id = id;
        this.productId = productId;
        this.author = author;
        this.text = text;
        this.rating = rating;
        this.status = status;
        this.date = date;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
    
}