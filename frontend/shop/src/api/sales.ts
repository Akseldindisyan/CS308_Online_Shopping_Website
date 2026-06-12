import { apiRequest } from "./client";
import type { UUID } from "../data/types";

export interface SalesInvoiceItem {
  productId: UUID | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesInvoice {
  invoiceId: UUID;
  customerId: UUID | null;
  customerName: string;
  date: string | null;
  totalPrice: number;
  items: SalesInvoiceItem[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ProductRevenue {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface RevenueReport {
  daily: DailyRevenue[];
  products: ProductRevenue[];
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

function rangeQuery(start?: string, end?: string): string {
  const q = new URLSearchParams();
  if (start) q.set("start", start);
  if (end) q.set("end", end);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function getSalesInvoices(start?: string, end?: string): Promise<SalesInvoice[]> {
  return apiRequest<SalesInvoice[]>(`/api/sales/invoices${rangeQuery(start, end)}`);
}

export async function getRevenueReport(start?: string, end?: string): Promise<RevenueReport> {
  return apiRequest<RevenueReport>(`/api/sales/report${rangeQuery(start, end)}`);
}