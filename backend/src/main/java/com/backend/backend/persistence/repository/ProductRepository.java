package com.backend.backend.persistence.repository;

import java.util.UUID;
import com.backend.backend.persistence.entity.ProductEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    public Page<ProductEntity> findAllByProductNameContainingIgnoreCaseOrderByProductNameAsc(String productName, Pageable p);
    public Page<ProductEntity> findAllByOrderByIdAsc(Pageable p);
    
    public Page<ProductEntity> findAllByOrderByPriceAsc(Pageable p);
    public Page<ProductEntity> findAllByOrderByPriceDesc(Pageable p);

    public Page<ProductEntity> findAllByOrderByRatingAsc(Pageable p);
    public Page<ProductEntity> findAllByOrderByRatingDesc(Pageable p);

    public ProductEntity findByProductName(String name);

}