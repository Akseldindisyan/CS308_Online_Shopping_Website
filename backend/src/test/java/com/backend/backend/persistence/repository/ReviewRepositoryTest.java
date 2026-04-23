package com.backend.backend.persistence.repository;

//Import classes
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.ReviewEntity;

//Import basic structures
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

//Import Test libraries
import com.backend.backend.persistence.entity.UserEntity;
import org.hibernate.validator.internal.constraintvalidators.bv.AssertTrueValidator;
import org.junit.jupiter.api.*;


import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@DataJpaTest
public class ReviewRepositoryTest {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ReviewRepository reviewRepository;

    //Functions to automate testing
    @BeforeEach
    void initializeMockupDatabase() {
        reviewRepository.deleteAll();
        //Products
        ProductEntity product1 = new ProductEntity("Laptop A", 4.5, 50, "Model X", "SN12345", "High performance laptop", 1200.0, "Distributor A", "USA");
        ProductEntity product2 = new ProductEntity("Smartphone", 4.7, 100, "Model Y", "SN54321", "Latest smartphone", 800.0, "Distributor B", "China");
        ProductEntity product3 = new ProductEntity("Headphones", 4.2, 70, "Model H", "SN67890", "Noise-cancelling headphones", 200.0, "Distributor C", "Germany");

        //Save product Repository
        productRepository.saveAll(List.of(product1, product2, product3));

        //Users
        UserEntity user1 = new UserEntity("John", "Doe", "johndoe88", "john.doe@example.com", "pass1234", LocalDate.of(1988, 5, 12), UserEntity.Role.CUSTOMER);
        UserEntity user2 = new UserEntity("Jane", "Smith", "janesmith99", "jane.smith@example.com", "securepass", LocalDate.of(1999, 8, 24),  UserEntity.Role.CUSTOMER);
        UserEntity user3 = new UserEntity("Alice", "Johnson", "alicej", "alice.j@example.com", "qwerty99", LocalDate.of(1995, 2, 10),  UserEntity.Role.CUSTOMER);
        UserEntity user4 = new UserEntity("Bob", "Brown", "bobbrown", "bob.b@example.com", "admin123", LocalDate.of(1980, 11, 5),  UserEntity.Role.CUSTOMER);
        UserEntity user5 = new UserEntity("Charlie", "Davis", "charlied", "charlie.d@example.com", "mypassword", LocalDate.of(2001, 7, 19), UserEntity.Role.CUSTOMER);

        userRepository.saveAll(List.of(user1, user2, user3, user4, user5));

        List<ReviewEntity> mockReviews = List.of(
                new ReviewEntity(product1, user1, 9, "Excellent quality, very satisfied with this purchase.", true,
                        LocalDate.of(2023, 5, 10), 24, LocalDate.of(2023, 5, 12), LocalDate.of(2023, 5, 12)),

                new ReviewEntity(product1, user2, 4, "It works, but the build quality feels a bit cheap.", true,
                        LocalDate.of(2023, 6, 15), 2, LocalDate.of(2023, 6, 20), LocalDate.of(2023, 6, 21)),

                new ReviewEntity(product2, user3, 1, "Terrible. Broke on the first day. Do not buy.", false,
                        LocalDate.of(2023, 7, 1), 0, LocalDate.of(2023, 7, 2), null),

                new ReviewEntity(product3, user4, 10, "Absolutely perfect. Exceeded all expectations.", true,
                        LocalDate.of(2023, 8, 12), 56, LocalDate.of(2023, 8, 14), LocalDate.of(2023, 8, 14)),

                new ReviewEntity(product3, user5, 7, "Good product, but shipping was delayed.", true,
                        LocalDate.of(2023, 9, 5), 5, LocalDate.of(2023, 9, 10), LocalDate.of(2023, 9, 10))
        );

        reviewRepository.saveAll(mockReviews);
    }

    @AfterEach
    void cleanUpDatabase() { reviewRepository.deleteAll(); }

    @Test
    void findByRatingTest() {
        List<ReviewEntity> result = reviewRepository.findByRating(9);

        assertEquals(1, result.size());

        assertEquals("Excellent quality, very satisfied with this purchase.", result.getFirst().getComment());
        assertEquals(9,result.getFirst().getRating());
    }

    @Test
    void findByCommentTest() {
        List<ReviewEntity> result = reviewRepository.findByComment("It works, but the build quality feels a bit cheap.");

        assertEquals(1, result.size());

        assertEquals("Jane", result.getFirst().getUser().getName());
        assertEquals("It works, but the build quality feels a bit cheap.", result.getFirst().getComment());
    }

    @Test
    void findByProductBuyDateTest() {
        List<ReviewEntity> result = reviewRepository.findByProductBuyDate(LocalDate.of(2023, 9, 5));

        assertEquals(1, result.size());

        assertEquals(LocalDate.of(2023, 9, 5), result.getFirst().getProductBuyDate());
    }

    @Test
    void findByProductBuyDateLessThanEqualTest() {
        List<LocalDate> expectedList = List.of(LocalDate.of(2023, 5, 10), LocalDate.of(2023, 6, 15), LocalDate.of(2023, 7, 1),LocalDate.of(2023, 8, 12),LocalDate.of(2023, 9, 5));
        List<ReviewEntity> result = reviewRepository.findByProductBuyDateLessThanEqual(LocalDate.of(2023, 9, 5));

        assertEquals(5, result.size());

        for(int i = 0; i < result.size(); i++){
            LocalDate currentElement = result.get(i).getProductBuyDate();
            assertTrue(expectedList.contains(currentElement));
        }
    }

    @Test
    void findByProductBuyDateGreaterThanEqualTest() {
        List<ReviewEntity> result = reviewRepository.findByProductBuyDateGreaterThanEqual(LocalDate.of(2023, 9, 5));

        assertEquals(1, result.size());

        assertEquals(LocalDate.of(2023, 9, 5), result.getFirst().getProductBuyDate());
    }

    @Test
    void findByFoundThisHelpfulTest() {
        List<ReviewEntity> result = reviewRepository.findByFoundThisHelpful(24);

        assertEquals(1, result.size());

        assertEquals(24, result.getFirst().getFoundThisHelpful());

    }

    @Test
    void findByFoundThisHelpfulLessThanEqualTest() {
        // Looking for reviews where 'foundThisHelpful' is <= 5
        List<ReviewEntity> result = reviewRepository.findByFoundThisHelpfulLessThanEqual(5);

        // We expect to find 3 reviews: user3 (0), user2 (2), and user5 (5)
        assertEquals(3, result.size());

        for (ReviewEntity review : result) {
            assertTrue(review.getFoundThisHelpful() <= 5);
        }
    }

    @Test
    void findByFoundThisHelpfulGreaterThanEqualTest() {
        // Looking for reviews where 'foundThisHelpful' is >= 24
        List<ReviewEntity> result = reviewRepository.findByFoundThisHelpfulGreaterThanEqual(24);

        // We expect to find 2 reviews: user1 (24) and user4 (56)
        assertEquals(2, result.size());

        for (ReviewEntity review : result) {
            assertTrue(review.getFoundThisHelpful() >= 24);
        }
    }

    @Test
    void findByCreatedAtTest() {
        List<ReviewEntity> result = reviewRepository.findByCreatedAt(LocalDate.of(2023, 8, 14));

        assertEquals(1, result.size());

        assertEquals(LocalDate.of(2023, 8, 14), result.getFirst().getCreatedAt());
    }

    @Test
    void findByCreatedAtLessThanEqualTest() {
        LocalDate targetDate = LocalDate.of(2023, 7, 2);
        List<ReviewEntity> result = reviewRepository.findByCreatedAtLessThanEqual(targetDate);

        // We expect to find 3 reviews: user1 (May 12), user2 (June 20), and user3 (July 2)
        assertEquals(3, result.size());

        for (ReviewEntity review : result) {
            assertTrue(review.getCreatedAt().isBefore(targetDate) || review.getCreatedAt().isEqual(targetDate));
        }
    }

    @Test
    void findByCreatedAtGreaterThanEqualTest() {
        LocalDate targetDate = LocalDate.of(2023, 8, 14);
        List<ReviewEntity> result = reviewRepository.findByCreatedAtGreaterThanEqual(targetDate);

        // We expect to find 2 reviews: user4 (Aug 14) and user5 (Sept 10)
        assertEquals(2, result.size());

        for (ReviewEntity review : result) {
            assertTrue(review.getCreatedAt().isAfter(targetDate) || review.getCreatedAt().isEqual(targetDate));
        }
    }

    @Test
    void findByApprovedAtTest() {
        List<ReviewEntity> result = reviewRepository.findByApprovedAt(LocalDate.of(2023, 8, 14));

        assertEquals(1, result.size());

        assertEquals(LocalDate.of(2023, 8, 14), result.getFirst().getApprovedAt());
    }

    @Test
    void findByApprovedAtLessThanEqualTest() {
        LocalDate targetDate = LocalDate.of(2023, 6, 21);
        List<ReviewEntity> result = reviewRepository.findByApprovedAtLessThanEqual(targetDate);

        // We expect to find 2 reviews: user1 (May 12) and user2 (June 21).
        // Note: user3's approvedAt is null, so it shouldn't be matched by Spring Data.
        assertEquals(2, result.size());

        for (ReviewEntity review : result) {
            assertNotNull(review.getApprovedAt());
            assertTrue(review.getApprovedAt().isBefore(targetDate) || review.getApprovedAt().isEqual(targetDate));
        }
    }

    @Test
    void findByApprovedAtGreaterThanEqualTest() {
        LocalDate targetDate = LocalDate.of(2023, 8, 14);
        List<ReviewEntity> result = reviewRepository.findByApprovedAtGreaterThanEqual(targetDate);

        // We expect to find 2 reviews: user4 (Aug 14) and user5 (Sept 10)
        assertEquals(2, result.size());

        for (ReviewEntity review : result) {
            assertNotNull(review.getApprovedAt());
            assertTrue(review.getApprovedAt().isAfter(targetDate) || review.getApprovedAt().isEqual(targetDate));
        }
    }

}
