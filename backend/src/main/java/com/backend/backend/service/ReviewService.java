package com.backend.backend.service;

import com.backend.backend.api.dto.ProductCardDTO;
import com.backend.backend.api.dto.ReviewDTO;
import com.backend.backend.api.dto.UserDTO;
import com.backend.backend.api.exception.ResourceNotFoundException;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.ReviewEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.ReviewRepository;
import com.backend.backend.persistence.repository.UserRepository;
import org.springframework.cglib.core.Local;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    ReviewService(ReviewRepository reviewRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public List<ReviewDTO> getUserReviews(UUID userId) {
        List<ReviewDTO> result = new ArrayList<>();
        UserEntity user = getExistingUser(userId);
        List<ReviewEntity> reviewEntities = reviewRepository.findByUser(user);
        //Convert all review entities to O and add to the result list
        for (int i = 0; i < reviewEntities.size(); i++) {
            ReviewEntity tempReview = reviewEntities.get(i);
            if(tempReview.isApprovedByProductMan() == true) {
                ReviewDTO temp = new ReviewDTO(
                        tempReview.getRating(),
                        tempReview.getId(),
                        tempReview.getUser().getUsername(),
                        tempReview.getComment(),
                        tempReview.getCreatedAt(),
                        tempReview.getProduct().getId(),
                        tempReview.getProduct().getProductName(),
                        true
                );
                result.add(temp);
            }
        }
        return result;
    }

    public List<ReviewDTO> getProductReviews(UUID productId) {
        List<ReviewDTO> result = new ArrayList<>();;
        ProductEntity product = getExistingProduct(productId);
        List<ReviewEntity> reviewEntities = reviewRepository.findByProduct(product);
        //Convert all review entities to DTo and add to the result list
        for (int i = 0; i < reviewEntities.size(); i++) {
            ReviewEntity tempReview = reviewEntities.get(i);
            if(tempReview.isApprovedByProductMan() == true) {
                ReviewDTO temp = new ReviewDTO(
                        tempReview.getRating(),
                        tempReview.getId(),
                        tempReview.getUser().getUsername(),
                        tempReview.getComment(),
                        tempReview.getCreatedAt(),
                        tempReview.getProduct().getId(),
                        tempReview.getProduct().getProductName(),
                        true
                );
                result.add(temp);
            }
        }
        return result;
    }

    public UserEntity getExistingUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + userId));
    }

    public ProductEntity getExistingProduct(UUID productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND", "Product not found: " + productId));
    }

    //Save reviews
    public void CreateReview(ProductEntity product, UserEntity user, double rating, String comment, boolean approvedByProductMan, LocalDate productBuyDate, int foundThisHelpful, LocalDate createdAt, LocalDate approvedAt) {
        ReviewEntity newReview = new ReviewEntity(product, user, rating, comment, approvedByProductMan, productBuyDate, foundThisHelpful, createdAt, approvedAt);
        reviewRepository.save(newReview);
    }

    public void updateRating(ProductEntity product){
        List<ReviewEntity> reviews = reviewRepository.findByProduct(product);
        ReviewEntity lastReview = reviews.getLast();
        int len = reviews.size();
        double currentRating = product.getRating();
        double added_rating = lastReview.getRating();
        double sum = currentRating * (len - 1);
        double newRating = (sum + added_rating) / len;
        double rounded = Math.round(newRating * 10.0) / 10.0;
        product.setRating(rounded);
        productRepository.save(product);
    }
    private ReviewDTO toDTO(ReviewEntity r) {
        return new ReviewDTO(
                r.getRating(),
                r.getId(),
                r.getUser().getUsername(),
                r.getComment(),
                r.getCreatedAt(),
                r.getProduct().getId(),
                r.getProduct().getProductName(),
                r.isApprovedByProductMan()
        );
    }

    public List<ReviewDTO> getApprovedProductReviewsWithComment(UUID productId) {
        return reviewRepository.findByProduct_IdAndApprovedByProductManTrue(productId)
                .stream()
                .filter(r -> r.getComment() != null && !r.getComment().isBlank())
                .map(this::toDTO)
                .toList();
    }

    public List<ReviewDTO> getPendingReviews() {
        return reviewRepository.findByApprovedByProductManFalse()
                .stream()
                .map(this::toDTO)
                .toList();
    }
    public void approveReview(UUID reviewId) {
        ReviewEntity r = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        r.setApprovedByProductMan(true);
        r.setApprovedAt(LocalDate.now());
        reviewRepository.save(r);
    }
    public void rejectReview(UUID reviewId) {
        reviewRepository.deleteById(reviewId);
    }


}
