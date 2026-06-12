package com.backend.backend.service;

import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.CartRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class CartCreationService {

    private final CartRepository cartRepository;
    private final CartCreationAttemptService cartCreationAttemptService;

    public CartCreationService(
            CartRepository cartRepository,
            CartCreationAttemptService cartCreationAttemptService) {
        this.cartRepository = cartRepository;
        this.cartCreationAttemptService = cartCreationAttemptService;
    }

    public CartEntity getOrCreateUserCart(UserEntity user) {
        return cartRepository.findFirstByUserAndCheckedOutFalseOrderByIdAsc(user)
                .orElseGet(() -> createUserCartOrReturnWinner(user));
    }

    public CartEntity getOrCreateGuestCart(String guestToken) {
        return cartRepository.findFirstByGuestTokenAndCheckedOutFalseOrderByIdAsc(guestToken)
                .orElseGet(() -> createGuestCartOrReturnWinner(guestToken));
    }

    private CartEntity createUserCartOrReturnWinner(UserEntity user) {
        try {
            return cartCreationAttemptService.createUserCart(user);
        } catch (DataIntegrityViolationException exception) {
            return cartRepository.findFirstByUserAndCheckedOutFalseOrderByIdAsc(user)
                    .orElseThrow(() -> exception);
        }
    }

    private CartEntity createGuestCartOrReturnWinner(String guestToken) {
        try {
            return cartCreationAttemptService.createGuestCart(guestToken);
        } catch (DataIntegrityViolationException exception) {
            return cartRepository.findFirstByGuestTokenAndCheckedOutFalseOrderByIdAsc(guestToken)
                    .orElseThrow(() -> exception);
        }
    }
}
