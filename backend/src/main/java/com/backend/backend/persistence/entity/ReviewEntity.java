package com.backend.backend.persistence.entity;

import jakarta.persistence.*;
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
    private double rating;

    @Column(name = "review_comment")
    private String comment;

    private boolean approvedByProductMan;

    private LocalDate productBuyDate;

    private int foundThisHelpful;

    private LocalDate createdAt;

    private LocalDate approvedAt;

    public ReviewEntity(ProductEntity product, UserEntity user, double rating, String comment, boolean approvedByProductMan, LocalDate productBuyDate, int foundThisHelpful, LocalDate createdAt, LocalDate approvedAt) {
        this.product = product;
        this.user = user;
        this.rating = rating;
        this.comment = comment;
        this.approvedByProductMan = approvedByProductMan;
        this.productBuyDate = productBuyDate;
        this.foundThisHelpful = foundThisHelpful;
        this.createdAt = createdAt;
        this.approvedAt = approvedAt;

    }
}
