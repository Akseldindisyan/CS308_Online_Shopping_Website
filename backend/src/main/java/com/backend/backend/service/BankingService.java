package com.backend.backend.service;

import com.backend.backend.api.dto.*;
import com.backend.backend.persistence.entity.*;
import com.backend.backend.persistence.repository.*;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class BankingService {
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;
    private final InvoiceEmailService invoiceEmailService;
    private final CartRepository cartRepository;

    public BankingService(ProductRepository productRepository,
                          InvoiceRepository invoiceRepository,
                          UserRepository userRepository,
                          DeliveryRepository deliveryRepository,
                          InvoiceEmailService invoiceEmailService,
                          CartRepository cartRepository) {
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.deliveryRepository = deliveryRepository;
        this.invoiceEmailService = invoiceEmailService;
        this.cartRepository = cartRepository;
    }


    @Transactional
    public InvoiceDTO tryCheckout(CartDTO cart, String address) throws MessagingException {
        UserEntity user = findUser(cart.userId());
        List<InvoiceItemEntity> invoiceItems = processItems(cart.items());
        InvoiceEntity invoice = createAndSaveInvoice(user, invoiceItems, cart.totalPrice());
        createDelivery(invoice, user, address);
        clearCart(cart.cartId());
        invoiceEmailService.sendInvoiceEmail(invoice);
        return toDTO(invoice, cart.userId());
    }

    private UserEntity findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
    }

    private List<InvoiceItemEntity> processItems(List<CartItemDTO> items) {
        return items.stream()
                .map(this::processItem)
                .toList();
    }

    private InvoiceItemEntity processItem(CartItemDTO item) {
        ProductEntity product = productRepository.findById(item.productId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + item.productId()));

        if (product.getStock() < item.quantity()) {
            throw new RuntimeException("Insufficient stock for product: " + item.productId());
        }

        product.setStock(product.getStock() - item.quantity());
        productRepository.save(product);

        InvoiceItemEntity invoiceItem = new InvoiceItemEntity();
        invoiceItem.setProduct(product);
        invoiceItem.setQuantity(item.quantity());
        invoiceItem.setUnitPrice(item.unitPrice());
        invoiceItem.setTotalPrice(item.lineTotal());
        return invoiceItem;
    }

    private InvoiceEntity createAndSaveInvoice(UserEntity user, List<InvoiceItemEntity> items, double totalPrice) {
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setCustomer(user);
        invoice.setTotalPrice(totalPrice);
        invoice.setDate(new Date());
        items.forEach(item -> item.setInvoice(invoice));
        invoice.setItems(items);
        return invoiceRepository.save(invoice);
    }

    private InvoiceDTO toDTO(InvoiceEntity invoice, UUID userId) {
        List<InvoiceItemDTO> itemDTOs = invoice.getItems().stream()
                .map(i -> new InvoiceItemDTO(
                        i.getId(),
                        i.getProduct().getId(),
                        i.getProduct().getProductName(),
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getTotalPrice()
                )).toList();

        return new InvoiceDTO(
                invoice.getId(),
                userId,
                itemDTOs,
                invoice.getTotalPrice(),
                invoice.getDate().toString()
        );
    }

    private DeliveryEntity createDelivery(InvoiceEntity invoice, UserEntity user, String address) {
        DeliveryEntity delivery = new DeliveryEntity();
        delivery.setInvoice(invoice);
        delivery.setCustomer(user);
        delivery.setAddress(address);
        delivery.setCompleted(false);
        delivery.setStatus("PENDING");
        delivery.setCreatedAt(new Date());
        return deliveryRepository.save(delivery);
    }

    private void clearCart(UUID cartId) {
        cartRepository.findById(cartId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }
}