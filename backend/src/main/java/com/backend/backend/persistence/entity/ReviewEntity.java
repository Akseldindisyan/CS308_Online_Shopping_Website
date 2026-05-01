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
@Table(name = "review")
public class ReviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "review_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Min(1)
    @Max(5)
    @Column(name = "rating")
    private double rating;

    @Column(name = "review_comment")
    private String comment;

    @Column(name = "approved_by_product_man")
    private boolean approvedByProductMan;

    @Column(name = "product_buy_date")
    private LocalDate productBuyDate;

    @Column(name = "found_this_helpful")
    private int foundThisHelpful;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "approved_at")
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
