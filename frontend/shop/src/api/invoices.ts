import { apiRequest } from "./client";
import type { InvoiceDTO } from "../data/types";

export async function getAllInvoices(): Promise<InvoiceDTO[]> {
  return apiRequest<InvoiceDTO[]>("/api/orders");
}
