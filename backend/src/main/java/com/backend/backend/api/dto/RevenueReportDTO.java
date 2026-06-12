package com.backend.backend.api.dto;

import java.util.List;

public record RevenueReportDTO(
        List<Daily> daily,
        List<ProductLine> products,
        double totalRevenue,
        double totalCost,
        double totalProfit
) {
    public record Daily(String date, double revenue, double cost, double profit) {}
    public record ProductLine(String name, double revenue, double cost, double profit) {}
}