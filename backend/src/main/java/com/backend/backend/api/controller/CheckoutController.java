package com.backend.backend.api.controller;


import com.backend.backend.api.dto.CartDTO;
import com.backend.backend.api.dto.InvoiceDTO;
import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.service.BankingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final BankingService bankingService;

    public CheckoutController(BankingService bankingService) {
        this.bankingService = bankingService;
    }

    @PostMapping
    public ResponseEntity<?> checkout(@RequestBody CartDTO cartDTO) {
        try {
            InvoiceDTO invoice = bankingService.tryCheckout(cartDTO);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }

    }
}