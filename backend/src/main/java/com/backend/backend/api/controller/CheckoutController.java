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
    public ResponseEntity<?> checkout(@RequestBody CartDTO cartDTO, @RequestParam String address) {
        try {
            InvoiceDTO invoice = bankingService.tryCheckout(cartDTO, address);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            e.printStackTrace();
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(msg);
        }
    }
}