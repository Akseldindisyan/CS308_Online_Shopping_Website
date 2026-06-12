import { apiRequest } from "./client";
import type { UUID } from "../data/types";

export interface RefundItem {
  invoiceItemId: UUID;
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface RefundResponse {
  refundId: UUID;
  customerName: string;
  invoiceId: UUID;
  items: RefundItem[];
  status: string;
  date: string | null;
}

export async function getMyRefunds(): Promise<RefundResponse[]> {
  return apiRequest<RefundResponse[]>("/api/refunds/mine");
}

export async function requestRefund(
  invoiceId: UUID,
  itemIdsToRefund: UUID[],
): Promise<RefundResponse> {
  return apiRequest<RefundResponse>("/api/refunds", {
    method: "POST",
    body: JSON.stringify({ invoiceId, itemIdsToRefund }),
  });
}

export async function getPendingRefunds(): Promise<RefundResponse[]> {
  return apiRequest<RefundResponse[]>("/api/refunds/pending");
}

export async function acceptRefund(refundId: UUID): Promise<void> {
  return apiRequest<void>(`/api/refunds/${refundId}/accept`, { method: "PATCH" });
}

export async function rejectRefund(refundId: UUID): Promise<void> {
  return apiRequest<void>(`/api/refunds/${refundId}/reject`, { method: "PATCH" });
}