package com.backend.backend.api.controller;

import com.backend.backend.api.dto.CommentDTO;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.ReviewEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.security.JwtService;
import com.backend.backend.service.ProductService;
import com.backend.backend.service.ReviewService;
import com.backend.backend.api.dto.ReviewDTO;
import com.backend.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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

    ReviewController(ReviewService reviewService, JwtService jwt, UserService userService, ProductService productService) {
        this.reviewService = reviewService;
        this.jwt = jwt;
        this.userService = userService;
        this.productService = productService;
    }

    /**
     * Get all reviews written by a specific user.
     * URL: GET /api/reviews/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public List<ReviewDTO> getUserReviews(@PathVariable UUID userId) {
        List<ReviewDTO> reviews = reviewService.getUserReviews(userId);
        return reviews;
    }

    /**
     * Get all reviews for a specific product.
     * URL: GET /api/reviews/product/{productId}
     */
    @GetMapping("/product/{productId}")
    public List<ReviewDTO> getProductReviews(@PathVariable UUID productId) {
        List<ReviewDTO> reviews = reviewService.getProductReviews(productId);
        return reviews;
    }

    @PostMapping("/product/comment/")
    @ResponseStatus(value = HttpStatus.OK)
    public boolean setComment(@RequestBody CommentDTO comment){
        String username = jwt.extractUsername(comment.token());
        UserEntity user = userService.getUserByUsername(username);
        UUID uuid = UUID.fromString(comment.productId());
        ProductEntity p = productService.getProductById(uuid);
        LocalDate date = LocalDate.parse(comment.commentDate());
        reviewService.CreateReview(p, user, comment.rating(), comment.comment(), true, null, 0, date, null);
        return true;
    }

}
