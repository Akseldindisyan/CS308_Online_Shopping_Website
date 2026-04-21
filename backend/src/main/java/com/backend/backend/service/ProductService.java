package com.backend.backend.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.backend.backend.api.dto.ProductCardDTO;
import com.backend.backend.api.dto.ProductDetailedDTO;
import com.backend.backend.api.exception.BadRequestException;
import com.backend.backend.api.mapper.ProductMapper;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;

import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository ProductRepo;

    public ProductService(ProductRepository ProductRepo){
        this.ProductRepo = ProductRepo;
    }

    public Page<ProductEntity> getAllOrderByID(int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.findAllByOrderByIdAsc(p);
    }

    public Page<ProductEntity> getAllOrderByPriceAsc(int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.findAllByOrderByPriceAsc(p);
    }

    public Page<ProductEntity> getAllOrderByPriceDesc(int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.findAllByOrderByPriceDesc(p);
    }

    public Page<ProductEntity> getAllOrderByRatingAsc(int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.findAllByOrderByRatingAsc(p);
    }

    public Page<ProductEntity> getAllOrderByRatingDesc(int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.findAllByOrderByRatingDesc(p);
    }

    public Page<ProductEntity> searchByProductName(String name, int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.searchByProductNameLike(name, p);
    }

    public void UpdateStock(String name, int amount){
        ProductEntity product = ProductRepo.findByProductName(name);
        product.setStock(amount);
        ProductRepo.save(product);
    }

    public void CreateProduct(String productName, double rating, int stock, String model, String serialNumber, String desc, double price, String distInfo, String country, String category){
        ProductEntity newProduct = new ProductEntity(productName, rating, stock, model, serialNumber, desc, price, distInfo, country, category);
        ProductRepo.save(newProduct);
    }

    public Page<ProductCardDTO> getProductCards(int page, String sort, int size) {
        Page<ProductEntity> entities = switch (sort) {
            case "price_asc"   -> getAllOrderByPriceAsc(page, size);
            case "price_desc"  -> getAllOrderByPriceDesc(page, size);
            case "rating_asc"  -> getAllOrderByRatingAsc(page, size);
            case "rating_desc" -> getAllOrderByRatingDesc(page, size);
            default            -> getAllOrderByID(page, size);
        };
        return entities.map(ProductMapper::toCardDTO);
    }

    public Page<ProductCardDTO> searchProductCards(String name, int page, int size) {
        String normalizedName = name == null ? "" : name.trim();
        if (normalizedName.isEmpty()) {
            throw new BadRequestException("INVALID_SEARCH_QUERY", "Search query cannot be empty");
        }

        if (normalizedName.length() > 100) {
            throw new BadRequestException("INVALID_SEARCH_QUERY", "Search query is too long");
        }

        return searchByProductName(normalizedName, page, size)
                .map(ProductMapper::toCardDTO);
    }

    public ProductDetailedDTO getProductDetail(UUID id) {
        ProductEntity entity = ProductRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return ProductMapper.toDetailedDTO(entity);
    }

    
}