package com.backend.backend.service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

public record RefundEmailDetails(
        UUID refundId,
        UUID invoiceId,
        String customerEmail,
        String customerName,
        String customerSurname,
        Date date,
        double refundAmount,
        List<RefundedItem> items) {

    public record RefundedItem(
            String productName,
            int quantity,
            double unitPrice,
            double totalPrice) {
    }
}
