package com.backend.backend.api.controller;

import com.backend.backend.api.dto.ProductCardDTO;
import com.backend.backend.api.dto.ProductDetailedDTO;
import com.backend.backend.service.ProductService;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.*;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api")
@Validated
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public List<ProductCardDTO> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "id") String sort, 
            @RequestParam(defaultValue = "5") int size) {
        return productService.getProductCards(page, sort, size).getContent();
    }

    @GetMapping("/products/search")
    public List<ProductCardDTO> searchProducts(
            @RequestParam @NotBlank(message = "Search query cannot be blank") @Size(max = 100, message = "Search query must be at most 100 characters") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return productService.searchProductCards(name, page, size).getContent();
    }

    @GetMapping("/products/{id}")
    public ProductDetailedDTO getProductDetail(@PathVariable UUID id) {
        return productService.getProductDetail(id);
    }
}