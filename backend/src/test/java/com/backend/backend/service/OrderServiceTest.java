package com.backend.backend.service;

import com.backend.backend.api.exception.ConflictException;
import com.backend.backend.persistence.entity.DeliveryEntity;
import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.entity.ProductEntity;
import com.backend.backend.persistence.entity.UserEntity;
import com.backend.backend.persistence.repository.DeliveryRepository;
import com.backend.backend.persistence.repository.InvoiceRepository;
import com.backend.backend.persistence.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private DeliveryRepository deliveryRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    void cancelOrderRestocksItemsAndMarksDeliveryCancelled() {
        UUID userId = UUID.randomUUID();
        UUID invoiceId = UUID.randomUUID();
        UserEntity customer = new UserEntity();
        customer.setId(userId);
        ProductEntity product = new ProductEntity();
        product.setStock(4);
        InvoiceItemEntity item = new InvoiceItemEntity();
        item.setProduct(product);
        item.setQuantity(2);
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setId(invoiceId);
        invoice.setCustomer(customer);
        invoice.setItems(List.of(item));
        DeliveryEntity delivery = new DeliveryEntity();
        delivery.setStatus("IN_TRANSIT");

        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(deliveryRepository.findByInvoice_Id(invoiceId)).thenReturn(Optional.of(delivery));

        orderService.cancelOrder(invoiceId, userId);

        assertEquals(6, product.getStock());
        assertEquals("CANCELLED", delivery.getStatus());
        verify(productRepository).save(product);
        verify(deliveryRepository).save(delivery);
    }

    @Test
    void cancelOrderRejectsDeliveredOrder() {
        UUID userId = UUID.randomUUID();
        UUID invoiceId = UUID.randomUUID();
        UserEntity customer = new UserEntity();
        customer.setId(userId);
        InvoiceEntity invoice = new InvoiceEntity();
        invoice.setCustomer(customer);
        invoice.setItems(List.of());
        DeliveryEntity delivery = new DeliveryEntity();
        delivery.setStatus("DELIVERED");

        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(deliveryRepository.findByInvoice_Id(invoiceId)).thenReturn(Optional.of(delivery));

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> orderService.cancelOrder(invoiceId, userId));

        assertEquals("DELIVERED_ORDER_CANNOT_BE_CANCELLED", exception.getCode());
        verify(deliveryRepository, never()).save(delivery);
    }
}
