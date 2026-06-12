package com.backend.backend.service;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.CartRepository;

@ExtendWith(MockitoExtension.class)
class CartCreationServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartCreationAttemptService cartCreationAttemptService;

    @InjectMocks
    private CartCreationService cartCreationService;

    @Test
    void getOrCreateUserCart_whenConcurrentInsertWins_returnsExistingCart() {
        UserEntity user = new UserEntity();
        CartEntity winner = new CartEntity();
        winner.setUser(user);

        when(cartRepository.findFirstByUserAndCheckedOutFalseOrderByIdAsc(user))
                .thenReturn(Optional.empty(), Optional.of(winner));
        when(cartCreationAttemptService.createUserCart(user))
                .thenThrow(new DataIntegrityViolationException("duplicate active cart"));

        CartEntity result = cartCreationService.getOrCreateUserCart(user);

        assertSame(winner, result);
    }

    @Test
    void getOrCreateGuestCart_whenConcurrentInsertWins_returnsExistingCart() {
        String guestToken = UUID.randomUUID().toString();
        CartEntity winner = new CartEntity();
        winner.setGuestToken(guestToken);

        when(cartRepository.findFirstByGuestTokenAndCheckedOutFalseOrderByIdAsc(guestToken))
                .thenReturn(Optional.empty(), Optional.of(winner));
        when(cartCreationAttemptService.createGuestCart(guestToken))
                .thenThrow(new DataIntegrityViolationException("duplicate active cart"));

        CartEntity result = cartCreationService.getOrCreateGuestCart(guestToken);

        assertSame(winner, result);
    }
}
