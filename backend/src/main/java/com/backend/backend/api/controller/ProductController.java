package com.backend.backend.api.controller;

import com.backend.backend.api.dto.*;
import com.backend.backend.api.mapper.ProductMapper;
import com.backend.backend.service.ProductService;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
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
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "sort", defaultValue = "id") String sort,
            @RequestParam(name = "size", defaultValue = "5") int size,
            @RequestParam(name = "inStock", defaultValue = "false") boolean inStock,
            @RequestParam(name = "category", required = false) String category) {
        return productService.getProductCards(page, sort, size, inStock, category).getContent();
    }

    @GetMapping("/products/all")
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public List<ProductCardDTO> getAllProductsAdmin(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "sort", defaultValue = "id") String sort,
            @RequestParam(name = "size", defaultValue = "200") int size,
            @RequestParam(name = "inStock", defaultValue = "false") boolean inStock) {
        return productService.getAdminProductCards(page, sort, size, inStock).getContent();
    }

    @GetMapping("/products/search")
    public List<ProductCardDTO> searchProducts(
            @RequestParam @NotBlank(message = "Search query cannot be blank") @Size(max = 100, message = "Search query must be at most 100 characters") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "false") boolean inStock,
            @RequestParam(required = false) String category) {
        return productService.searchProductCards(name, page, size, sort, inStock, category).getContent();
    }

    @GetMapping("/products/{id}")
    public ProductDetailedDTO getProductDetail(@PathVariable UUID id) {
        return productService.getProductDetail(id);
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public ProductDetailedDTO createProduct(@RequestBody CreateProductRequest req) {
        var entity = productService.createProduct(
                req.productName(), req.price(), req.stock(), req.category(),
                req.model(), req.serialNumber(), req.desc(), req.distInfo(),
                req.country(), req.imageUrl(), req.active(), req.warrantyStatus());
        return ProductMapper.toDetailedDTO(entity);
    }

    @DeleteMapping("/products/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public void deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
    }

    @PatchMapping("/products/{id}/stock")
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public ProductCardDTO updateStock(@PathVariable UUID id, @RequestBody UpdateStockRequest req) {
        var entity = productService.updateStock(id, req.stock());
        return ProductMapper.toCardDTO(entity);
    }

    @PatchMapping("/products/{id}/active")
    @PreAuthorize("hasRole('PRODUCT_MANAGER')")
    public ProductCardDTO setActive(@PathVariable UUID id, @RequestBody SetActiveRequest req) {
        var entity = productService.setActive(id, req.active());
        return ProductMapper.toCardDTO(entity);
    }
}