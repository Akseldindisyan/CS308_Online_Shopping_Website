import { apiRequest } from "./client";
import type { UUID } from "../data/types";

export interface OrderItem {
  invoiceItemId: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  invoiceId: UUID;
  customerId: UUID;
  items: OrderItem[];
  totalPrice: number;
  date: string | null;
  status: string;
}

export async function getOrders(userId: UUID): Promise<Order[]> {
  return apiRequest<Order[]>(`/api/orders/${userId}`);
}

export async function cancelOrder(invoiceId: UUID): Promise<void> {
  await apiRequest<void>(`/api/orders/${invoiceId}/cancel`, {
    method: "PATCH",
  });
}
