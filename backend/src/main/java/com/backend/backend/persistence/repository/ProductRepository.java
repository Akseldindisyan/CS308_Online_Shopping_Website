package com.backend.backend.persistence.repository;

import java.util.UUID;

import com.backend.backend.persistence.entity.ProductEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, UUID>, JpaSpecificationExecutor<ProductEntity> {

    @Query("SELECT p FROM ProductEntity p WHERE (LOWER(p.productName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.desc) LIKE LOWER(CONCAT('%', :searchTerm, '%')) )")
    Page<ProductEntity> searchByProductNameLike(@Param("searchTerm") String searchTerm, Pageable p);

    Page<ProductEntity> findAllByOrderByIdAsc(Pageable p);
    
    Page<ProductEntity> findAllByOrderByPriceAsc(Pageable p);
    Page<ProductEntity> findAllByOrderByPriceDesc(Pageable p);

    Page<ProductEntity> findAllByOrderByRatingAsc(Pageable p);
    Page<ProductEntity> findAllByOrderByRatingDesc(Pageable p);

    ProductEntity findByProductName(String name);

    @Modifying
    @Query("UPDATE ProductEntity p SET p.stock = p.stock + :quantity WHERE p.id = :productId")
    int incrementStock(@Param("productId") UUID productId, @Param("quantity") int quantity);

}
