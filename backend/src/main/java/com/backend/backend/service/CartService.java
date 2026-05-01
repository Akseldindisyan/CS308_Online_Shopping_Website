package com.backend.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.backend.backend.api.exception.BadRequestException;
import com.backend.backend.api.exception.ConflictException;
import com.backend.backend.api.exception.ForbiddenOperationException;
import com.backend.backend.api.exception.ResourceNotFoundException;

import com.backend.backend.api.dto.CartDTO;
import com.backend.backend.api.dto.CartItemDTO;
import com.backend.backend.persistence.entity.CartEntity;
import com.backend.backend.persistence.entity.CartItemEntity;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.CartItemRepository;
import com.backend.backend.persistence.repository.CartRepository;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.UserRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserRepository userRepository,
            ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    public CartDTO getUserCart(UUID userId) {
        UserEntity user = getExistingUser(userId);
        CartEntity cart = getOrCreateUserCart(user);
        return toCartDTO(cart);
    }

    public CartDTO getGuestCart(String guestToken) {
        validateGuestToken(guestToken);
        CartEntity cart = getOrCreateGuestCart(guestToken);
        return toCartDTO(cart);
    }

    public CartDTO createGuestCart() {
        String guestToken = UUID.randomUUID().toString();
        CartEntity cart = getOrCreateGuestCart(guestToken);
        return toCartDTO(cart);
    }

    @Transactional
    public CartDTO addItemToUserCart(UUID userId, UUID productId, int quantity) {
        UserEntity user = getExistingUser(userId);
        CartEntity cart = getOrCreateUserCart(user);
        addOrUpdateCartItem(cart, productId, quantity);
        return toCartDTO(cart);
    }

    @Transactional
    public CartDTO addItemToGuestCart(String guestToken, UUID productId, int quantity) {
        validateGuestToken(guestToken);
        CartEntity cart = getOrCreateGuestCart(guestToken);
        addOrUpdateCartItem(cart, productId, quantity);
        return toCartDTO(cart);
    }

    @Transactional
    public CartDTO removeItemFromUserCart(UUID userId, UUID productId) {
        UserEntity user = getExistingUser(userId);
        CartEntity cart = getOrCreateUserCart(user);
        removeItem(cart, productId);
        return toCartDTO(cart);
    }

    @Transactional
    public CartDTO removeItemFromGuestCart(String guestToken, UUID productId) {
        validateGuestToken(guestToken);
        CartEntity cart = getOrCreateGuestCart(guestToken);
        removeItem(cart, productId);
        return toCartDTO(cart);
    }

    @Transactional
    public void checkoutUserCart(UUID userId) {
        UserEntity user = getExistingUser(userId);
        CartEntity cart = getOrCreateUserCart(user);

        List<CartItemEntity> items = cartItemRepository.findByCart(cart);
        if (items.isEmpty()) {
            throw new BadRequestException("CART_EMPTY", "Cart is empty");
        }

        for (CartItemEntity item : items) {
            ProductEntity product = item.getProduct();
            if (product.getStock() < item.getQuantity()) {
                throw new ConflictException(
                        "INSUFFICIENT_STOCK",
                        "Insufficient stock for product: " + product.getProductName());
            }
        }

        for (CartItemEntity item : items) {
            ProductEntity product = item.getProduct();
            product.setStock(product.getStock() - item.getQuantity());
            productRepository.save(product);
        }

        cartItemRepository.deleteByCart(cart);
    }

    public void checkoutGuestCart(String guestToken) {
        validateGuestToken(guestToken);
        throw new ForbiddenOperationException("GUEST_CHECKOUT_FORBIDDEN", "Guests cannot checkout. Please register or login.");
    }

    @Transactional
    public CartDTO mergeGuestCartIntoUserCart(String guestToken, UUID userId) {
        validateGuestToken(guestToken);
        UserEntity user = getExistingUser(userId);

        CartEntity guestCart = cartRepository.findByGuestTokenAndCheckedOutFalse(guestToken)
                .orElseThrow(() -> new ResourceNotFoundException("GUEST_CART_NOT_FOUND", "Guest cart not found"));

        CartEntity userCart = getOrCreateUserCart(user);
        List<CartItemEntity> guestItems = cartItemRepository.findByCart(guestCart);

        for (CartItemEntity guestItem : guestItems) {
            ProductEntity product = guestItem.getProduct();
            CartItemEntity userItem = cartItemRepository.findByCartAndProduct(userCart, product).orElseGet(() -> {
                CartItemEntity newItem = new CartItemEntity();
                newItem.setCart(userCart);
                newItem.setProduct(product);
                newItem.setQuantity(0);
                return newItem;
            });

            userItem.setQuantity(userItem.getQuantity() + guestItem.getQuantity());
            cartItemRepository.save(userItem);
        }

        cartItemRepository.deleteByCart(guestCart);
        cartRepository.delete(guestCart);

        return toCartDTO(userCart);
    }

    private void addOrUpdateCartItem(CartEntity cart, UUID productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("INVALID_QUANTITY", "Quantity must be greater than zero");
        }

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND", "Product not found: " + productId));

        CartItemEntity item = cartItemRepository.findByCartAndProduct(cart, product).orElseGet(() -> {
            CartItemEntity newItem = new CartItemEntity();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(0);
            return newItem;
        });

        item.setQuantity(item.getQuantity() + quantity);
        cartItemRepository.save(item);
    }

    private void removeItem(CartEntity cart, UUID productId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND", "Product not found: " + productId));

        CartItemEntity item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException("CART_ITEM_NOT_FOUND", "Product does not exist in cart"));

        cartItemRepository.delete(item);
    }

    private CartEntity getOrCreateUserCart(UserEntity user) {
        return cartRepository.findByUserAndCheckedOutFalse(user).orElseGet(() -> {
            CartEntity cart = new CartEntity();
            cart.setUser(user);
            return cartRepository.save(cart);
        });
    }

    private CartEntity getOrCreateGuestCart(String guestToken) {
        return cartRepository.findByGuestTokenAndCheckedOutFalse(guestToken).orElseGet(() -> {
            CartEntity cart = new CartEntity();
            cart.setGuestToken(guestToken);
            return cartRepository.save(cart);
        });
    }

    private UserEntity getExistingUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + userId));
    }

    private void validateGuestToken(String guestToken) {
        if (guestToken == null || guestToken.isBlank()) {
            throw new BadRequestException("GUEST_TOKEN_REQUIRED", "Guest token is required");
        }
    }

    private CartDTO toCartDTO(CartEntity cart) {
        List<CartItemEntity> items = cartItemRepository.findByCart(cart);
        List<CartItemDTO> itemDTOs = new ArrayList<>();
        double total = 0.0;

        for (CartItemEntity item : items) {
            double lineTotal = item.getProduct().getPrice() * item.getQuantity();
            total += lineTotal;
            CartItemDTO itemDTO = new CartItemDTO(
                    item.getProduct().getId(),
                    item.getProduct().getProductName(),
                    item.getProduct().getPrice(),
                    item.getQuantity(),
                    lineTotal);
            itemDTOs.add(itemDTO);
        }

        UUID userId = cart.getUser() != null ? cart.getUser().getId() : null;
        return new CartDTO(
                cart.getId(),
                userId,
                cart.getGuestToken(),
                cart.getGuestToken() != null,
                cart.getUser() != null,
                itemDTOs,
                total);
    }
}
