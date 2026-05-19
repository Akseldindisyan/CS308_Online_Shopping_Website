package com.backend.backend.api.controller;

import com.backend.backend.api.dto.CommentDTO;
import com.backend.backend.api.dto.ReviewDTO;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.security.JwtService;
import com.backend.backend.service.ProductService;
import com.backend.backend.service.ReviewService;
import com.backend.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/review")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtService jwt;
    private final UserService userService;
    private final ProductService productService;

    ReviewController(ReviewService reviewService, JwtService jwt,
                     UserService userService, ProductService productService) {
        this.reviewService = reviewService;
        this.jwt = jwt;
        this.userService = userService;
        this.productService = productService;
    }

    @GetMapping("/user/{userId}")
    public List<ReviewDTO> getUserReviews(@PathVariable UUID userId) {
        return reviewService.getUserReviews(userId);
    }


    @GetMapping("/product/{productId}")
    public List<ReviewDTO> getProductReviews(@PathVariable UUID productId) {
        return reviewService.getApprovedProductReviewsWithComment(productId);
    }

    /** Admin paneli: onay bekleyen review'lar (yani comment'li ve approved=false olanlar). */
    @GetMapping("/pending")
    public List<ReviewDTO> getPendingReviews() {
        return reviewService.getPendingReviews();
    }

    @PostMapping("/product/comment/")
    @ResponseStatus(HttpStatus.OK)
    public boolean setComment(@RequestBody CommentDTO comment) {
        String username = jwt.extractUsername(comment.token());
        UserEntity user = userService.getUserByUsername(username);
        UUID uuid = UUID.fromString(comment.productId());
        ProductEntity p = productService.getProductById(uuid);
        LocalDate date = LocalDate.parse(comment.commentDate());

        String commentText = comment.comment() == null ? "" : comment.comment().trim();
        boolean autoApproved = commentText.isEmpty();
        LocalDate approvedAt = autoApproved ? date : null;

        reviewService.CreateReview(
                p, user, comment.rating(),
                commentText,
                autoApproved,   // approvedByProductMan
                null,           // productBuyDate
                0,              // foundThisHelpful
                date,           // createdAt
                approvedAt      // approvedAt
        );

        reviewService.updateRating(p);
        return true;
    }

    @PostMapping("/{reviewId}/approve")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public ResponseEntity<Void> approveReview(@PathVariable UUID reviewId) {
        reviewService.approveReview(reviewId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{reviewId}/reject")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public ResponseEntity<Void> rejectReview(@PathVariable UUID reviewId) {
        reviewService.rejectReview(reviewId);
        return ResponseEntity.ok().build();
    }
}