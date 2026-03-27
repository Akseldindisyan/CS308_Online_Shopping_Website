package com.backend.backend.persistence.repository;

//Import classes
import com.backend.backend.persistence.entity.ProductEntity;

//Import basic structures
import java.util.List;
import java.util.Optional;
import java.util.UUID;

//Import Test libraries
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

@DataJpaTest
public class ProductRepositoryTest {

    @Autowired
    ProductRepository productRepository;

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






}