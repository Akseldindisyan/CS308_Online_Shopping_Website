package com.backend.backend.service;

import com.backend.backend.api.dto.InvoiceItemDTO;
import com.backend.backend.api.dto.RevenueReportDTO;
import com.backend.backend.api.dto.SalesInvoiceDTO;
import com.backend.backend.persistence.entity.InvoiceEntity;
import com.backend.backend.persistence.entity.InvoiceItemEntity;
import com.backend.backend.persistence.repository.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
public class SalesService {

    private final InvoiceRepository invoiceRepository;

    public SalesService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public List<SalesInvoiceDTO> getInvoices(LocalDate start, LocalDate end) {
        return fetch(start, end).stream().map(this::toDTO).toList();
    }

    public RevenueReportDTO getRevenueReport(LocalDate start, LocalDate end) {
        List<InvoiceEntity> invoices = fetch(start, end);

        Map<String, double[]> byDate = new TreeMap<>();
        Map<String, double[]> byProduct = new LinkedHashMap<>();
        double totalRevenue = 0.0;
        double totalCost = 0.0;

        for (InvoiceEntity inv : invoices) {
            String day = inv.getDate() != null ? toLocalDate(inv.getDate()).toString() : "unknown";
            double invoiceRevenue = 0.0;
            double invoiceCost = 0.0;

            List<InvoiceItemEntity> items = inv.getItems();
            if (items == null || items.isEmpty()) {
                invoiceRevenue = inv.getTotalPrice();
                invoiceCost = 0.0; // TODO(refund)
            } else {
                for (InvoiceItemEntity item : items) {
                    double lineRevenue = item.getTotalPrice();
                    double lineCost = 0.0; // TODO(refund)
                    invoiceRevenue += lineRevenue;
                    invoiceCost += lineCost;

                    String name = item.getProduct() != null
                            ? item.getProduct().getProductName() : "Unknown";
                    double[] p = byProduct.computeIfAbsent(name, k -> new double[3]);
                    p[0] += lineRevenue;
                    p[1] += lineCost;
                    p[2] += lineRevenue - lineCost;
                }
            }

            double[] d = byDate.computeIfAbsent(day, k -> new double[3]);
            d[0] += invoiceRevenue;
            d[1] += invoiceCost;
            d[2] += invoiceRevenue - invoiceCost;

            totalRevenue += invoiceRevenue;
            totalCost += invoiceCost;
        }

        List<RevenueReportDTO.Daily> daily = new ArrayList<>();
        byDate.forEach((day, v) ->
                daily.add(new RevenueReportDTO.Daily(day, round(v[0]), round(v[1]), round(v[2]))));

        List<RevenueReportDTO.ProductLine> products = new ArrayList<>();
        byProduct.forEach((name, v) ->
                products.add(new RevenueReportDTO.ProductLine(name, round(v[0]), round(v[1]), round(v[2]))));
        products.sort((a, b) -> Double.compare(b.profit(), a.profit()));

        return new RevenueReportDTO(daily, products,
                round(totalRevenue), round(totalCost), round(totalRevenue - totalCost));
    }

    private List<InvoiceEntity> fetch(LocalDate start, LocalDate end) {
        if (start == null && end == null) {
            return invoiceRepository.findAllByOrderByDateAsc();
        }
        ZoneId zone = ZoneId.systemDefault();
        LocalDate from = (start != null) ? start : LocalDate.of(1970, 1, 1);
        LocalDate to = (end != null) ? end : LocalDate.now();
        Date startInclusive = Date.from(from.atStartOfDay(zone).toInstant());
        Date endExclusive = Date.from(to.plusDays(1).atStartOfDay(zone).toInstant());
        return invoiceRepository
                .findByDateGreaterThanEqualAndDateLessThanOrderByDateAsc(startInclusive, endExclusive);
    }

    private SalesInvoiceDTO toDTO(InvoiceEntity inv) {
        List<InvoiceItemEntity> src = inv.getItems();
        List<InvoiceItemDTO> items = (src == null ? List.<InvoiceItemEntity>of() : src).stream()
                .map(i -> new InvoiceItemDTO(
                        i.getProduct() != null ? i.getProduct().getId() : null,
                        i.getProduct() != null ? i.getProduct().getProductName() : "Unknown",
                        i.getQuantity(),
                        i.getUnitPrice(),
                        i.getTotalPrice()))
                .toList();

        return new SalesInvoiceDTO(
                inv.getId(),
                inv.getCustomer() != null ? inv.getCustomer().getId() : null,
                inv.getCustomer() != null
                        ? (safe(inv.getCustomer().getName()) + " " + safe(inv.getCustomer().getSurname())).trim()
                        : "Unknown",
                inv.getDate() != null ? toLocalDate(inv.getDate()).toString() : null,
                inv.getTotalPrice(),
                items);
    }

    private static String safe(String s) { return s != null ? s : ""; }

    private static LocalDate toLocalDate(Date date) {
        return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}