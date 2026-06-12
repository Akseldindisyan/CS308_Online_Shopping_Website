package com.backend.backend.api.controller;

import com.backend.backend.api.dto.RevenueReportDTO;
import com.backend.backend.api.dto.SalesInvoiceDTO;
import com.backend.backend.service.SalesService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

    private final SalesService salesService;

    public SalesController(SalesService salesService) {
        this.salesService = salesService;
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasRole('SALES_MANAGER')")
    public List<SalesInvoiceDTO> getInvoices(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return salesService.getInvoices(start, end);
    }

    @GetMapping("/report")
    @PreAuthorize("hasRole('SALES_MANAGER')")
    public RevenueReportDTO getReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return salesService.getRevenueReport(start, end);
    }
}