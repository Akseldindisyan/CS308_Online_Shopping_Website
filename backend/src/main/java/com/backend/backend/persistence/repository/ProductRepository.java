package com.backend.backend.persistence.repository;

import java.util.List;
import java.util.UUID;


import com.backend.backend.persistence.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    public List<ProductEntity> findTop10ByProductNameContainingIgnoreCaseOrderByProductNameAsc(String productName);
    public List<ProductEntity> findTop5ByOrderByIdAsc();
    
    public List<ProductEntity> findTop5ByOrderByPriceAsc();
    public List<ProductEntity> findTop5ByOrderByPriceDesc();

    public List<ProductEntity> findTop5ByOrderByRatingAsc();
    public List<ProductEntity> findTop5ByOrderByRatingDesc();




}