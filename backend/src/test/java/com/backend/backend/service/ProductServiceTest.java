package com.backend.backend.service;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mockito;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.ArgumentCaptor;


@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    ProductRepository productRepository;

    @InjectMocks
    ProductService productService;

    @Test
    void getAllByIdAscTest(){
        List<ProductEntity> productList = List.of(
                new ProductEntity("Laptop A", 4.5, 50, "Model X", "SN12345", "High performance laptop", 1200.0, "Distributor A", "USA"),
                new ProductEntity("Smartphone", 4.7, 100, "Model Y", "SN54321", "Latest smartphone", 800.0, "Distributor B", "China")
        );
        Page<ProductEntity> expectedProductList = new PageImpl<>(productList);

        Mockito.when(productRepository.findAllByOrderByIdAsc(any(Pageable.class))).thenReturn(expectedProductList);
        Page<ProductEntity> result = productService.getAllOrderByID(0);

        //Check length
        assertEquals(2, result.getTotalElements());
        //Get and Check content
        List<ProductEntity> expectedContent = expectedProductList.getContent();
        List<ProductEntity> resultContent = result.getContent();
        for (int i = 0; i < productList.size(); i++) {
            assertEquals(expectedContent.get(i).getProductName(), resultContent.get(i).getProductName());
        }
        //Testing if the Page Request
        Mockito.verify(productRepository).findAllByOrderByIdAsc(PageRequest.of(0, 5));
        //result.forEach(System.out::println);

    }

    @Test
    void getAllOrderByPriceTest(){
        List<ProductEntity> productList = List.of(
                new ProductEntity("Smartphone", 4.7, 100, "Model Y", "SN54321", "Latest smartphone", 800.0, "Distributor B", "China"),
                new ProductEntity("Laptop A", 4.5, 50, "Model X", "SN12345", "High performance laptop", 1200.0, "Distributor A", "USA")
        );
        Page<ProductEntity> expectedProductList = new PageImpl<>(productList);

        Mockito.when(productRepository.findAllByOrderByPriceAsc(any(Pageable.class))).thenReturn(expectedProductList);
        Page<ProductEntity> result = productService.getAllOrderByPriceAsc(0);

        //Get and Check content
        List<ProductEntity> expectedContent = expectedProductList.getContent();
        List<ProductEntity> resultContent = result.getContent();
        for (int i = 0; i < productList.size(); i++) {
            assertEquals(expectedContent.get(i).getProductName(), resultContent.get(i).getProductName());
        }
        //Testing if the Page Request
        Mockito.verify(productRepository).findAllByOrderByPriceAsc(PageRequest.of(0, 5));

    }

    @Test
    void getAllOrderByRatingAscTest() {
        List<ProductEntity> productList = List.of(
                new ProductEntity("Budget Phone", 3.5, 100, "Model Z", "SN999", "Basic smartphone", 300.0, "Distributor C", "China"),
                new ProductEntity("Premium Laptop", 4.9, 50, "Model X", "SN123", "High performance", 2000.0, "Distributor A", "USA")
        );
        Page<ProductEntity> expectedProductList = new PageImpl<>(productList);

        Mockito.when(productRepository.findAllByOrderByRatingAsc(any(Pageable.class))).thenReturn(expectedProductList);

        Page<ProductEntity> result = productService.getAllOrderByRatingAsc(0);

        List<ProductEntity> expectedContent = expectedProductList.getContent();
        List<ProductEntity> resultContent = result.getContent();

        for (int i = 0; i < productList.size(); i++) {
            assertEquals(expectedContent.get(i).getProductName(), resultContent.get(i).getProductName());
        }

        Mockito.verify(productRepository).findAllByOrderByRatingAsc(PageRequest.of(0, 5));
    }

    @Test
    void getAllByProductNameContainingIgnoreCaseOrderByProductNameAscTest() {
        List<ProductEntity> productList = List.of(
                new ProductEntity("Gaming Laptop", 4.8, 20, "Model G", "SN111", "Fast laptop", 1500.0, "Distributor A", "USA"),
                new ProductEntity("Work Laptop", 4.2, 50, "Model W", "SN222", "Reliable laptop", 900.0, "Distributor B", "UK")
        );
        Page<ProductEntity> expectedProductList = new PageImpl<>(productList);

        Mockito.when(productRepository.findAllByProductNameContainingIgnoreCaseOrderByProductNameAsc(
                Mockito.eq("Laptop"), Mockito.any(Pageable.class))).thenReturn(expectedProductList);

        Page<ProductEntity> result = productService.getAllByProductNameContainingIgnoreCaseOrderByProductNameAsc("Laptop", 0);

        List<ProductEntity> expectedContent = expectedProductList.getContent();
        List<ProductEntity> resultContent = result.getContent();

        for (int i = 0; i < productList.size(); i++) {
            assertEquals(expectedContent.get(i).getProductName(), resultContent.get(i).getProductName());
        }

        Mockito.verify(productRepository).findAllByProductNameContainingIgnoreCaseOrderByProductNameAsc(
                "Laptop", PageRequest.of(0, 5));
    }

    @Test
    void UpdateStockTest(){
        ProductEntity existingProduct = new ProductEntity("Keyboard", 5.0, 20, "Model K", "SN111", "Desc", 50.0, "Dist", "USA");
        Mockito.when(productRepository.findByProductName("Keyboard")).thenReturn(existingProduct);

        productService.UpdateStock("Keyboard", 0);

        assertEquals(0, existingProduct.getStock());
        Mockito.verify(productRepository).save(existingProduct);
    }

    @Test
    void CreateProductTest(){
        productService.CreateProduct("Monitor", 4.5, 10, "Model M", "SN222", "4K Monitor", 300.0, "Dist", "USA");

        ArgumentCaptor<ProductEntity> captor = ArgumentCaptor.forClass(ProductEntity.class);
        Mockito.verify(productRepository).save(captor.capture());

        ProductEntity savedProduct = captor.getValue();
        assertEquals("Monitor", savedProduct.getProductName());
        assertEquals(10, savedProduct.getStock());
        assertEquals(300.0, savedProduct.getPrice());
    }



}
