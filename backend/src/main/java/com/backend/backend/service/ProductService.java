package com.backend.backend.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository ProductRepo;

    public ProductService(ProductRepository ProductRepo){
        this.ProductRepo = ProductRepo;
    }
    
    public Page<ProductEntity> getAllOrderByID(int page){
        Pageable p = PageRequest.of(page, 5);
        return ProductRepo.findAllByOrderByIdAsc(p);
    }

    public Page<ProductEntity> getAllOrderByPriceAsc(int page){
        Pageable p = PageRequest.of(page, 5);
        return ProductRepo.findAllByOrderByPriceAsc(p);
    }

    public Page<ProductEntity> getAllOrderByPriceDesc(int page){
        Pageable p = PageRequest.of(page, 5);
        return ProductRepo.findAllByOrderByPriceDesc(p);
    }

    public Page<ProductEntity> getAllOrderByRatingAsc(int page){
        Pageable p = PageRequest.of(page, 5);
        return ProductRepo.findAllByOrderByRatingAsc(p);
    }

    public Page<ProductEntity> getAllOrderByRatingDesc(int page){
        Pageable p = PageRequest.of(page, 5);
        return ProductRepo.findAllByOrderByRatingDesc(p);
    }

    public Page<ProductEntity> getAllByProductNameContainingIgnoreCaseOrderByProductNameAsc(String name, int page){
        Pageable p = PageRequest.of(page, 5);
        return ProductRepo.findAllByProductNameContainingIgnoreCaseOrderByProductNameAsc(name, p);
    }

    public void UpdateStock(String name, int amount){
        ProductEntity product = ProductRepo.findByProductName(name);
        product.setStock(amount);
        ProductRepo.save(product);

    }

    public void CreateProduct(String productName, double rating, int stock, String model, String serialNumber, String desc, double price, String distInfo, String country){
        ProductEntity newProduct = new ProductEntity(productName, rating, stock, model, serialNumber, desc, price, distInfo, country);
        ProductRepo.save(newProduct);
    }

    

}
