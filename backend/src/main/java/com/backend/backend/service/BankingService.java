package com.backend.backend.service;

import com.backend.backend.api.dto.CartDTO;
import com.backend.backend.api.dto.CartItemDTO;
import com.backend.backend.api.dto.InvoiceDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.persistence.entity.*;
import com.backend.backend.persistence.repository.DeliveryRepository;
import com.backend.backend.persistence.repository.InvoiceRepository;
import com.backend.backend.persistence.repository.ProductRepository;
import com.backend.backend.persistence.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class BankingService {
    private final ProductRepository productRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;
    private final DeliveryRepository deliveryRepository;

    public BankingService(ProductRepository productRepository,
                          InvoiceRepository invoiceRepository,
                          UserRepository userRepository,
                          DeliveryRepository deliveryRepository) {
        this.productRepository = productRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
        this.deliveryRepository = deliveryRepository;
    }



    @Transactional
    public InvoiceDTO tryCheckout(CartDTO cart) {
        UserEntity user = findUser(cart.userId());
        List<InvoiceItemEntity> invoiceItems = processItems(cart.items());
        InvoiceEntity invoice = createAndSaveInvoice(user, invoiceItems, cart.totalPrice());
        createDelivery(invoice, user, cart);
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
        invoice.setItems(items);
        invoice.setTotalPrice(totalPrice);
        invoice.setDate(new Date());
        return invoiceRepository.save(invoice);
    }

    private InvoiceDTO toDTO(InvoiceEntity invoice, UUID userId) {
        List<InvoiceItemDTO> itemDTOs = invoice.getItems().stream()
                .map(i -> new InvoiceItemDTO(
                        i.getProduct().getId(),
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

    private DeliveryEntity createDelivery(InvoiceEntity invoice, UserEntity user, CartDTO cart) {
        DeliveryEntity delivery = new DeliveryEntity();
        delivery.setInvoice(invoice);
        delivery.setCustomer(user);
        delivery.setAddress(user.getAddress().getFirst());
        delivery.setCompleted(false);
        delivery.setStatus("PENDING");
        delivery.setCreatedAt(new Date());
        return deliveryRepository.save(delivery);
    }
}