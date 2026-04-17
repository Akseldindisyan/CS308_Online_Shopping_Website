package com.backend.backend.api.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.api.dto.CartDTO;
import com.backend.backend.api.dto.CartMergeRequestDTO;
import com.backend.backend.api.dto.CartItemRequestDTO;
import com.backend.backend.service.CartService;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/user/{userId}")
    public CartDTO getUserCart(@PathVariable UUID userId) {
        return cartService.getUserCart(userId);
    }

    @PostMapping("/guest")
    @ResponseStatus(HttpStatus.CREATED)
    public CartDTO createGuestCart() {
        return cartService.createGuestCart();
    }

    @GetMapping("/guest/{guestToken}")
    public CartDTO getGuestCart(@PathVariable String guestToken) {
        return cartService.getGuestCart(guestToken);
    }

    @PostMapping("/user/{userId}/items")
    public CartDTO addItemToUserCart(@PathVariable UUID userId, @RequestBody CartItemRequestDTO request) {
        return cartService.addItemToUserCart(userId, request.productId(), request.quantity());
    }

    @PostMapping("/guest/{guestToken}/items")
    public CartDTO addItemToGuestCart(@PathVariable String guestToken, @RequestBody CartItemRequestDTO request) {
        return cartService.addItemToGuestCart(guestToken, request.productId(), request.quantity());
    }

    @PostMapping("/merge")
    public CartDTO mergeGuestCartIntoUserCart(@RequestBody CartMergeRequestDTO request) {
        return cartService.mergeGuestCartIntoUserCart(request.guestToken(), request.userId());
    }

    @DeleteMapping("/user/{userId}/items/{productId}")
    public CartDTO removeItemFromUserCart(@PathVariable UUID userId, @PathVariable UUID productId) {
        return cartService.removeItemFromUserCart(userId, productId);
    }

    @DeleteMapping("/guest/{guestToken}/items/{productId}")
    public CartDTO removeItemFromGuestCart(@PathVariable String guestToken, @PathVariable UUID productId) {
        return cartService.removeItemFromGuestCart(guestToken, productId);
    }

    @PostMapping("/user/{userId}/checkout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkoutUser(@PathVariable UUID userId) {
        cartService.checkoutUserCart(userId);
    }

    @PostMapping("/guest/{guestToken}/checkout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void checkoutGuest(@PathVariable String guestToken) {
        cartService.checkoutGuestCart(guestToken);
    }
}
