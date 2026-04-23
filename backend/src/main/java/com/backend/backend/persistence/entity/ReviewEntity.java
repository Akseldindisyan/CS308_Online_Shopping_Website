package com.backend.backend.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Min(1)
    @Max(10)
    private int rating;

    private String comment;

    private boolean approvedByProductManager;

    private LocalDate productBuyDate;

    private int foundThisHelpful;

    private LocalDate createdAt;

    private LocalDate approvedAt;

    public ReviewEntity(ProductEntity product, UserEntity user, int rating, String comment, boolean approvedByProductManager, LocalDate productBuyDate, int foundThisHelpful, LocalDate createdAt, LocalDate approvedAt) {
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.comment = comment;
        this.approvedByProductManager = approvedByProductManager;
        this.productBuyDate = productBuyDate;
        this.foundThisHelpful = foundThisHelpful;
        this.createdAt = createdAt;
        this.approvedAt = approvedAt;

    }
}
