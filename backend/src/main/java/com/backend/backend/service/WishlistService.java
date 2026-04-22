package com.backend.backend.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.backend.api.dto.WishlistDTO;
import com.backend.backend.api.mapper.WishlistMapper;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.WishlistEntity;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.WishlistRepository;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepo;
    private final ProductRepository productRepo;

    public WishlistService(WishlistRepository wishlistRepo, ProductRepository productRepo) {
        this.wishlistRepo = wishlistRepo;
        this.productRepo = productRepo;
    }

    public List<WishlistDTO> getWishlist(UUID userId) {
        List<WishlistEntity> items = wishlistRepo.findAllByUserId(userId);
        return items.stream()
                .map(item -> {
                    ProductEntity product = productRepo.findById(item.getProductId())
                            .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProductId()));
                    return WishlistMapper.toDTO(product);
                })
                .collect(Collectors.toList());
    }

    public void addToWishlist(UUID userId, UUID productId) {
        if (wishlistRepo.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product already exists in the wishlist");
        }
        wishlistRepo.save(new WishlistEntity(userId, productId));
    }

    @Transactional
    public void removeFromWishlist(UUID userId, UUID productId) {
        wishlistRepo.deleteByUserIdAndProductId(userId, productId);
    }
}