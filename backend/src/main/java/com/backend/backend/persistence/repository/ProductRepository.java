package com.backend.backend.persistence.repository;

import java.util.UUID;
import com.backend.backend.persistence.entity.ProductEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    @Query("SELECT p FROM ProductEntity p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY p.productName ASC")
    Page<ProductEntity> searchByProductNameLike(@Param("searchTerm") String searchTerm, Pageable p);

    Page<ProductEntity> findAllByOrderByIdAsc(Pageable p);
    
    Page<ProductEntity> findAllByOrderByPriceAsc(Pageable p);
    Page<ProductEntity> findAllByOrderByPriceDesc(Pageable p);

    Page<ProductEntity> findAllByOrderByRatingAsc(Pageable p);
    Page<ProductEntity> findAllByOrderByRatingDesc(Pageable p);

    ProductEntity findByProductName(String name);

}