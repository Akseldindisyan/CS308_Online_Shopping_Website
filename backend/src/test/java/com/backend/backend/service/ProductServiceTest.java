package com.backend.backend.service;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;


@SpringBootTest
public class ProductServiceTest {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    ProductService p;

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

    @AfterEach
    void cleanUpDatabase() {
        productRepository.deleteAll();
    }


    @Test
    void check1(){
        Page<ProductEntity> deneme = p.getAllOrderByID(0);

        deneme.forEach(System.out::println);

    }

    @Test
    void check2(){
        Page<ProductEntity> deneme = p.getAllOrderByPriceDesc(0);

        deneme.forEach(System.out::println);

    }

    @Test
    void check3(){
        Page<ProductEntity> deneme = p.getAllOrderByRatingAsc(0);

        deneme.forEach(System.out::println);

    }

    @Test
    void check4(){
        Page<ProductEntity> deneme = p.getAllByProductNameContainingIgnoreCaseOrderByProductNameAsc("Laptop",0);

        deneme.forEach(System.out::println);

    }

    @Test 
    void check5(){
        p.UpdateStock("Keyboard", 0);
        ProductEntity a = productRepository.findByProductName("Keyboard");
        System.out.println(a);
        
    }

    @Test 
    void check6(){
        p.CreateProduct("A", 0, 0, "A", "A", "A", 0, "A", "A");
        ProductEntity a = productRepository.findByProductName("A");
        System.out.println(a);
        
    }



}
