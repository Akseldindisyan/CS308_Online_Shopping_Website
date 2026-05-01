package com.backend.backend.service;

import com.backend.backend.api.dto.ReviewDTO;
import com.backend.backend.api.exception.ResourceNotFoundException;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.ReviewEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.ReviewRepository;
import com.backend.backend.persistence.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
public class ReviewServiceTest {

    @Mock
    ReviewRepository reviewRepository;
    @Mock
    UserRepository userRepository;
    @Mock
    ProductRepository productRepository;

    @InjectMocks
    ReviewService reviewService;

    @Test
    void getUserReviewsTest() {
        UUID userId = UUID.randomUUID();
        UserEntity mockUser = new UserEntity("John", "Doe", "johndoe", "john@example.com", "pass", LocalDate.of(1990, 1, 1), UserEntity.Role.CUSTOMER, "Turkey", "Istanbul", "A", "1111");
        mockUser.setId(userId);

        ProductEntity mockProduct = new ProductEntity("Laptop", 4.5, 50, "M1", "SN1", "Desc", 1200.0, "Dist", "USA", true);
        mockProduct.setId(UUID.randomUUID());

        ReviewEntity mockReview = new ReviewEntity(mockProduct, mockUser, 5.0, "Great product", true, LocalDate.now(), 0, LocalDate.now(), null);

        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        Mockito.when(reviewRepository.findByUser(mockUser)).thenReturn(List.of(mockReview));

        List<ReviewDTO> result = reviewService.getUserReviews(userId);

        assertEquals(1, result.size());
        assertEquals(5.0, result.get(0).rating());
        assertEquals("Laptop", result.get(0).product_name());
        assertEquals("johndoe", result.get(0).username());

        Mockito.verify(userRepository).findById(userId);
        Mockito.verify(reviewRepository).findByUser(mockUser);
    }

    @Test
    void getProductReviewsTest() {
        UUID productId = UUID.randomUUID();
        UserEntity mockUser = new UserEntity("Jane", "Smith", "janesmith", "jane@example.com", "pass", LocalDate.of(1995, 1, 1), UserEntity.Role.CUSTOMER, "Turkey", "Istanbul", "A", "1111");

        ProductEntity mockProduct = new ProductEntity("Smartphone", 4.7, 100, "M2", "SN2", "Desc", 800.0, "Dist", "China", true);
        mockProduct.setId(productId);

        ReviewEntity mockReview = new ReviewEntity(mockProduct, mockUser, 4.0, "Good phone", true, LocalDate.now(), 0, LocalDate.now(), null);

        Mockito.when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        Mockito.when(reviewRepository.findByProduct(mockProduct)).thenReturn(List.of(mockReview));

        List<ReviewDTO> result = reviewService.getProductReviews(productId);

        assertEquals(1, result.size());
        assertEquals(4.0, result.get(0).rating());
        assertEquals("Smartphone", result.get(0).product_name());
        assertEquals("janesmith", result.get(0).username());

        Mockito.verify(productRepository).findById(productId);
        Mockito.verify(reviewRepository).findByProduct(mockProduct);
    }

    @Test
    void getExistingUserTest() {
        UUID userId = UUID.randomUUID();
        UserEntity mockUser = new UserEntity();
        mockUser.setId(userId);

        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));

        UserEntity result = reviewService.getExistingUser(userId);

        assertEquals(userId, result.getId());
    }

    @Test
    void getExistingUserThrowsExceptionTest() {
        UUID userId = UUID.randomUUID();
        Mockito.when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.getExistingUser(userId));
    }

    @Test
    void getExistingProductTest() {
        UUID productId = UUID.randomUUID();
        ProductEntity mockProduct = new ProductEntity();
        mockProduct.setId(productId);

        Mockito.when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));

        ProductEntity result = reviewService.getExistingProduct(productId);

        assertEquals(productId, result.getId());
    }

    @Test
    void getExistingProductThrowsExceptionTest() {
        UUID productId = UUID.randomUUID();
        Mockito.when(productRepository.findById(productId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.getExistingProduct(productId));
    }

    @Test
    void CreateReviewTest() {
        ProductEntity mockProduct = new ProductEntity();
        mockProduct.setId(UUID.randomUUID());

        UserEntity mockUser = new UserEntity();
        mockUser.setId(UUID.randomUUID());

        double rating = 4.5;
        String comment = "Excellent quality.";
        boolean approvedByProductMan = true;
        LocalDate productBuyDate = LocalDate.of(2023, 1, 15);
        int foundThisHelpful = 10;
        LocalDate createdAt = LocalDate.now();
        LocalDate approvedAt = LocalDate.now();

        reviewService.CreateReview(mockProduct, mockUser, rating, comment, approvedByProductMan, productBuyDate, foundThisHelpful, createdAt, approvedAt);

        ArgumentCaptor<ReviewEntity> captor = ArgumentCaptor.forClass(ReviewEntity.class);
        Mockito.verify(reviewRepository).save(captor.capture());

        ReviewEntity savedReview = captor.getValue();

        assertEquals(mockProduct, savedReview.getProduct());
        assertEquals(mockUser, savedReview.getUser());
        assertEquals(rating, savedReview.getRating());
        assertEquals(comment, savedReview.getComment());
        assertEquals(approvedByProductMan, savedReview.isApprovedByProductMan());
        assertEquals(productBuyDate, savedReview.getProductBuyDate());
        assertEquals(foundThisHelpful, savedReview.getFoundThisHelpful());
        assertEquals(createdAt, savedReview.getCreatedAt());
        assertEquals(approvedAt, savedReview.getApprovedAt());
    }
}
