package com.backend.backend.persistence.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.CartItemEntity;
import com.backend.backend.persistence.entity.ProductEntity;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, UUID> {

    List<CartItemEntity> findByCart(CartEntity cart);

    Optional<CartItemEntity> findByCartAndProduct(CartEntity cart, ProductEntity product);

    void deleteByCart(CartEntity cart);
}

