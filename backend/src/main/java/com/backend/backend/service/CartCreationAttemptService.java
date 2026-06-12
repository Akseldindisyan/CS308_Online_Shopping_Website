package com.backend.backend.service;

import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CartCreationAttemptService {

    private final CartRepository cartRepository;

    public CartCreationAttemptService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CartEntity createUserCart(UserEntity user) {
        CartEntity cart = new CartEntity();
        cart.setUser(user);
        return cartRepository.saveAndFlush(cart);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CartEntity createGuestCart(String guestToken) {
        CartEntity cart = new CartEntity();
        cart.setGuestToken(guestToken);
        return cartRepository.saveAndFlush(cart);
    }
}
