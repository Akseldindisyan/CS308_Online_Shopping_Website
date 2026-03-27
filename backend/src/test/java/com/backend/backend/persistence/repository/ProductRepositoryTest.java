package com.backend.backend.persistence.repository;

//Import classes
import com.backend.backend.persistence.entity.ProductEntity;

//Import basic structures
import java.util.List;
import java.util.Optional;
import java.util.UUID;

//Import Test libraries
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
public class ProductRepositoryTest {

    @Autowired
    ProductRepository productRepository;

    //Funtions to automate testing
    @BeforeEach
    void initializeMockupDatabase() {
        productRepository.save(new ProductEntity("Laptop A", 4.5, 50, "Model X", "SN12345", "High performance laptop", 1200.0, "Distributor A", "USA"));
        productRepository.save(new ProductEntity("Smartphone", 4.7, 100, "Model Y", "SN54321", "Latest smartphone", 800.0, "Distributor B", "China"));
        productRepository.save(new ProductEntity("Headphones", 4.2, 70, "Model H", "SN67890", "Noise-cancelling headphones", 200.0, "Distributor C", "Germany"));
        productRepository.save(new ProductEntity("Monitor", 4.6, 30, "Model M", "SN98765", "4K UHD monitor", 350.0, "Distributor D", "Japan"));
        productRepository.save(new ProductEntity("Keyboard", 4.1, 120, "Model K", "SN11223", "Mechanical keyboard", 100.0, "Distributor E", "USA"));
        productRepository.save(new ProductEntity("Mouse", 4.3, 150, "Model S", "SN44556", "Wireless mouse", 50.0, "Distributor F", "China"));
        productRepository.save(new ProductEntity("Printer", 4.0, 25, "Model P", "SN77889", "All-in-one printer", 250.0, "Distributor G", "Japan"));
        productRepository.save(new ProductEntity("Laptop B", 4.4, 60, "Model T", "SN99001", "10-inch tablet", 400.0, "Distributor H", "USA"));
        productRepository.save(new ProductEntity("Camera", 4.5, 40, "Model C", "SN22334", "Digital SLR camera", 900.0, "Distributor I", "Germany"));
        productRepository.save(new ProductEntity("Smartwatch", 4.2, 80, "Model W", "SN55667", "Fitness smartwatch", 150.0, "Distributor J", "China"));
    }

    //Cleans the database
    @AfterEach
    void cleanUpDatabase() {
        productRepository.deleteAll();
    }


    //Tests
    @Test
    void findUserByIdNotAvailableTest(){
        System.out.println("Try to find a product with non existing id");
        //Create a product and save it
        ProductEntity productEntity = new ProductEntity("A", 5.0, 10, "A", "A", "A", 5.0, "A", "A");
        productRepository.save(productEntity);

        //Extract its id for search in the database
        UUID id = UUID.randomUUID();
        Optional<ProductEntity> result = productRepository.findById(id);

        //Check whether it is present
        assertTrue(result.isEmpty());
    }

    @Test
    void findUserByIdRegularTest(){
        System.out.println("Try to find a produc with id");
        //Create a product and save it
        ProductEntity productEntity = new ProductEntity("A", 5.0, 10, "A", "A", "A", 5.0, "A", "A");
        productRepository.save(productEntity);

        //Extract its id for search in the database
        UUID id = productEntity.getID();
        Optional<ProductEntity> result = productRepository.findById(id);

        //Check whether it is present
        assertTrue(result.isPresent());

        //Compare Expected and Result
        assertEquals(productEntity.getID(), result.get().getID());
        assertEquals(productEntity.getProductName(), result.get().getProductName());
    }

    @Test
    void findTop10ProductNameNotAvailableTest() {
        System.out.println("Try to find Top 10 products by Id");

        List<ProductEntity> result =
                productRepository.findTop10ByProductNameContainingIgnoreCaseOrderByProductNameAsc("Apple");

        // Print for debug
        //System.out.println("Number of items found: " + result.size());
        //result.forEach(System.out::println);

        //Check whether it is present
        assertTrue(result.isEmpty());
    }

    @Test
    void findTop10ProductNameRegularTest() {
        System.out.println("Try to find Top 10 products by Name");

        List<ProductEntity> result = productRepository.findTop10ByProductNameContainingIgnoreCaseOrderByProductNameAsc("Laptop");

        assertEquals(2, result.size());
        assertEquals("Laptop A", result.get(0).getProductName());
        assertEquals("Laptop B", result.get(1).getProductName());
    }


    @Test
    void findTop5ByOrderByIdAscRegularTest() {
        System.out.println("Try to find Top 5 products by Id");

        List<ProductEntity> result = productRepository.findTop5ByOrderByIdAsc();

        assertEquals(5, result.size());

        for (int i = 0; i < result.size() - 1; i++) {
            UUID currentId = result.get(i).getID();
            UUID nextId = result.get(i + 1).getID();

            assertTrue(currentId.compareTo(nextId) < 0);
        }
    }

    @Test
    void findTop5ByOrderByPriceAscRegularTest() {
        System.out.println("Try to find Top 5 products by Price in Ascending order");

        List<ProductEntity> result = productRepository.findTop5ByOrderByPriceAsc();

        assertEquals(5, result.size());
        for (int i = 0; i < result.size() - 1; i++) {
            assertTrue(result.get(i).getPrice() <= result.get(i + 1).getPrice());
        }
    }

    @Test
    void findTop5ByOrderByPriceDescRegularTest() {
        System.out.println("Try to find Top 5 products by Price in Descending order");

        List<ProductEntity> result = productRepository.findTop5ByOrderByPriceDesc();

        assertEquals(5, result.size());
        for (int i = 0; i < result.size() - 1; i++) {
            assertTrue(result.get(i).getPrice() >= result.get(i + 1).getPrice());
        }
    }

    @Test
    void findTop5ByOrderByRatingAscTest() {
        System.out.println("Try to find Top 5 products by Rating in Ascending order");

        List<ProductEntity> result = productRepository.findTop5ByOrderByRatingAsc();

        assertEquals(5, result.size());
        for (int i = 0; i < result.size() - 1; i++) {
            assertTrue(result.get(i).getRating() <= result.get(i + 1).getRating());
        }
    }

    @Test
    void findTop5ByOrderByRatingDescTest() {
        System.out.println("Try to find Top 5 products by Rating in Descending order");
        
        List<ProductEntity> result = productRepository.findTop5ByOrderByRatingDesc();

        assertEquals(5, result.size());
        for (int i = 0; i < result.size() - 1; i++) {
            assertTrue(result.get(i).getRating() >= result.get(i + 1).getRating());
        }
    }



}