package com.backend.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.backend.backend.api.dto.CartDTO;
import com.backend.backend.persistence.entity.AddressEntity;
import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.CartItemEntity;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.CartItemRepository;
import com.backend.backend.persistence.repository.CartRepository;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.UserRepository;
import com.backend.backend.service.UserService;

@ExtendWith(MockitoExtension.class)
public class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private CartService cartService;

    private CartEntity guestCart;
    private ProductEntity product;

    @BeforeEach
    void setUp() throws Exception {
        guestCart = new CartEntity();
        guestCart.setGuestToken("guest-token");

        product = new ProductEntity("Mouse", 4.2, 10, "M", "SN", "Wireless", 20.0, "D", "TR");
        setField(product, "id", UUID.randomUUID());
    }

    @Test
    void checkoutGuestCart_throwsForbidden() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> cartService.checkoutGuestCart("guest-token"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void addItemToGuestCart_addsItemAndComputesTotal() {
        when(cartRepository.findByGuestTokenAndCheckedOutFalse("guest-token")).thenReturn(Optional.of(guestCart));
        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCartAndProduct(guestCart, product)).thenReturn(Optional.empty());
        when(cartItemRepository.findByCart(guestCart)).thenReturn(List.of(buildItem(guestCart, product, 3)));

        CartDTO result = cartService.addItemToGuestCart("guest-token", product.getId(), 3);

        verify(cartItemRepository).save(any(CartItemEntity.class));
        assertEquals(1, result.items().size());
        assertEquals(60.0, result.totalPrice());
        assertFalse(result.canCheckout());
    }

    @Test
    void checkoutUserCart_decrementsStockAndClearsCart() throws Exception {
        AddressEntity address = new AddressEntity("Istanbul", "A", "11111", "Turkey");    
        UserEntity user = new UserEntity("A", "B", "ab", "ab@example.com", "pw", null, UserEntity.Role.CUSTOMER);
        userService.addAddress(user, address);
        UUID userId = UUID.randomUUID();
        setField(user, "id", userId);

        CartEntity userCart = new CartEntity();
        userCart.setUser(user);

        CartItemEntity item = buildItem(userCart, product, 2);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserAndCheckedOutFalse(user)).thenReturn(Optional.of(userCart));
        when(cartItemRepository.findByCart(userCart)).thenReturn(List.of(item));

        cartService.checkoutUserCart(userId);

        ArgumentCaptor<ProductEntity> productCaptor = ArgumentCaptor.forClass(ProductEntity.class);
        verify(productRepository).save(productCaptor.capture());
        verify(cartItemRepository).deleteByCart(userCart);
        assertEquals(8, productCaptor.getValue().getStock());
    }

    @Test
    void checkoutUserCart_whenStockInsufficient_throwsConflict() throws Exception {
        AddressEntity address = new AddressEntity("Istanbul", "A", "11111", "Turkey");    
        UserEntity user = new UserEntity("A", "B", "ab", "ab@example.com", "pw", null, UserEntity.Role.CUSTOMER);
        userService.addAddress(user, address);
        UUID userId = UUID.randomUUID();
        setField(user, "id", userId);

        CartEntity userCart = new CartEntity();
        userCart.setUser(user);

        CartItemEntity item = buildItem(userCart, product, 99);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cartRepository.findByUserAndCheckedOutFalse(user)).thenReturn(Optional.of(userCart));
        when(cartItemRepository.findByCart(userCart)).thenReturn(List.of(item));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> cartService.checkoutUserCart(userId));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(productRepository, never()).save(any(ProductEntity.class));
    }

    @Test
    void mergeGuestCartIntoUserCart_mergesItemsAndDeletesGuestCart() throws Exception {
        AddressEntity address = new AddressEntity("Istanbul", "A", "11111", "Turkey");    
        UserEntity user = new UserEntity("A", "B", "ab", "ab@example.com", "pw", null, UserEntity.Role.CUSTOMER);
        userService.addAddress(user, address);
        UUID userId = UUID.randomUUID();
        setField(user, "id", userId);

        CartEntity userCart = new CartEntity();
        userCart.setUser(user);

        CartItemEntity guestItem = buildItem(guestCart, product, 2);
        CartItemEntity existingUserItem = buildItem(userCart, product, 1);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cartRepository.findByGuestTokenAndCheckedOutFalse("guest-token")).thenReturn(Optional.of(guestCart));
        when(cartRepository.findByUserAndCheckedOutFalse(user)).thenReturn(Optional.of(userCart));
        when(cartItemRepository.findByCart(guestCart)).thenReturn(List.of(guestItem));
        when(cartItemRepository.findByCartAndProduct(userCart, product)).thenReturn(Optional.of(existingUserItem));
        when(cartItemRepository.findByCart(userCart)).thenReturn(List.of(existingUserItem));

        CartDTO result = cartService.mergeGuestCartIntoUserCart("guest-token", userId);

        assertEquals(3, existingUserItem.getQuantity());
        assertEquals(60.0, result.totalPrice());
        assertTrue(result.canCheckout());
        verify(cartItemRepository).save(existingUserItem);
        verify(cartItemRepository).deleteByCart(guestCart);
        verify(cartRepository).delete(guestCart);
    }

    private static CartItemEntity buildItem(CartEntity cart, ProductEntity product, int quantity) {
        CartItemEntity item = new CartItemEntity();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(quantity);
        return item;
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}

