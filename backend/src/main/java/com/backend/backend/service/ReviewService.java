package com.backend.backend.service;

import com.backend.backend.api.dto.ReviewDTO;
import com.backend.backend.api.exception.ResourceNotFoundException;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.ReviewEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.ReviewRepository;
import com.backend.backend.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;

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
            result.add(new ReviewDTO(tempReview.getRating(), tempReview.getProduct(), tempReview.getUser(), tempReview.getCreatedAt()));
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
            result.add(new ReviewDTO(tempReview.getRating(), tempReview.getProduct(), tempReview.getUser(), tempReview.getCreatedAt()));
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


}
