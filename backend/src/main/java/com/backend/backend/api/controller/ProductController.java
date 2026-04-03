package com.backend.backend.api.controller;

import com.backend.backend.api.dto.ProductCardDTO;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/products")
    public Page<ProductEntity> getAllProducts(@RequestParam(defaultValue = "0") int page) {
        return productService.getAllOrderByID(page);
    }
}