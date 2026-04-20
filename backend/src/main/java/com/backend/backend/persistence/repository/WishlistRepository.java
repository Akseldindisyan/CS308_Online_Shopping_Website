package com.backend.backend.persistence.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.persistence.entity.WishlistEntity;
import com.backend.backend.persistence.entity.WishlistId;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistEntity, WishlistId> {

    List<WishlistEntity> findAllByUserId(UUID userId);

    void deleteByUserIdAndProductId(UUID userId, UUID productId);

    boolean existsByUserIdAndProductId(UUID userId, UUID productId);
}