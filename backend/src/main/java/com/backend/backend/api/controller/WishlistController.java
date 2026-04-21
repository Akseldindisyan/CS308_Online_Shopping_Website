package com.backend.backend.api.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.backend.backend.api.dto.WishlistDTO;
import com.backend.backend.service.WishlistService;

@RestController
@RequestMapping("/api")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("/wishlist/{userId}")
    public List<WishlistDTO> getWishlist(@PathVariable UUID userId) {
        return wishlistService.getWishlist(userId);
    }

    @PostMapping("/wishlist/{userId}/{productId}")
    public String addToWishlist(@PathVariable UUID userId, @PathVariable UUID productId) {
        wishlistService.addToWishlist(userId, productId);
        return "Product added to wishlist";
    }

    @DeleteMapping("/wishlist/{userId}/{productId}")
    public String removeFromWishlist(@PathVariable UUID userId, @PathVariable UUID productId) {
        wishlistService.removeFromWishlist(userId, productId);
        return "Product removed from wishlist";
    }
}