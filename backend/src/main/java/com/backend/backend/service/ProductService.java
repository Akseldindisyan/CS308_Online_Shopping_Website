package com.backend.backend.service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import com.backend.backend.api.dto.ProductCardDTO;
import com.backend.backend.api.dto.ProductDetailedDTO;
import com.backend.backend.api.exception.BadRequestException;
import com.backend.backend.api.mapper.ProductMapper;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository ProductRepo;

    public ProductService(ProductRepository ProductRepo){
        this.ProductRepo = ProductRepo;
    }

    public ProductEntity getProductById(UUID id){
        return ProductRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: "));
    }

    public Page<ProductEntity> getAllOrderByID(int page, int size){
        Pageable p = PageRequest.of(page, size);
        return ProductRepo.findAllByOrderByIdAsc(p);
    }

    private Sort resolveSort(String sort) {
        return switch (sort == null ? "" : sort.trim().toLowerCase()) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating_asc" -> Sort.by(Sort.Direction.ASC, "rating");
            case "rating_desc", "highest_rated" -> Sort.by(Sort.Direction.DESC, "rating");
            case "id" -> Sort.by(Sort.Direction.ASC, "id");
            default -> Sort.by(Sort.Direction.ASC, "id");
        };
    }

    private Specification<ProductEntity> buildProductSpecification(String searchTerm, boolean inStock) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (searchTerm != null && !searchTerm.isBlank()) {
                String normalized = searchTerm.trim().toLowerCase();
                String likePattern = "%" + normalized + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.<String>get("productName")), likePattern),
                        cb.like(cb.lower(root.<String>get("desc")), likePattern)
                ));
            }

            if (inStock) {
                predicates.add(cb.gt(root.<Integer>get("stock"), 0));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Page<ProductEntity> findProducts(String searchTerm, int page, int size, String sort, boolean inStock) {
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        return ProductRepo.findAll(buildProductSpecification(searchTerm, inStock), pageable);
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
        Pageable p = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "productName"));
        return ProductRepo.searchByProductNameLike(name, p);
    }

    public Page<ProductEntity> searchProducts(String name, int page, int size, String sort, boolean inStock) {
        String normalizedName = name == null ? "" : name.trim();
        if (normalizedName.isEmpty()) {
            throw new BadRequestException("INVALID_SEARCH_QUERY", "Search query cannot be empty");
        }

        if (normalizedName.length() > 100) {
            throw new BadRequestException("INVALID_SEARCH_QUERY", "Search query is too long");
        }

        return findProducts(normalizedName, page, size, sort, inStock);
    }

    public Page<ProductEntity> getProducts(int page, int size, String sort, boolean inStock) {
        return findProducts(null, page, size, sort, inStock);
    }

    public void UpdateStock(String name, int amount){
        ProductEntity product = ProductRepo.findByProductName(name);
        product.setStock(amount);
        ProductRepo.save(product);
    }

    public void CreateProduct(String productName, double rating, int stock, String model, String serialNumber, String desc, double price, String distInfo, String country, String category, boolean active){
        ProductEntity newProduct = new ProductEntity(productName, rating, stock, model, serialNumber, desc, price, distInfo, country, active);
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

    public Page<ProductCardDTO> getProductCards(int page, String sort, int size, boolean inStock) {
        return getProducts(page, size, sort, inStock).map(ProductMapper::toCardDTO);
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

    public Page<ProductCardDTO> searchProductCards(String name, int page, int size, String sort, boolean inStock) {
        return searchProducts(name, page, size, sort, inStock).map(ProductMapper::toCardDTO);
    }

    public ProductDetailedDTO getProductDetail(UUID id) {
        ProductEntity entity = ProductRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return ProductMapper.toDetailedDTO(entity);
    }

    
}