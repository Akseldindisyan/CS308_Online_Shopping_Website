import { apiRequest } from "./client";
import type { UUID } from "../data/types";

export interface RefundResponse {
  refundId: UUID;
  invoiceId: UUID;
  status: string;
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
