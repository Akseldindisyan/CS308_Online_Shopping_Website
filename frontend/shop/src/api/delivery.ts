import { apiRequest } from "./client";
import type { UUID } from "../data/types";
export interface DeliveryItemDTO {
  productId: UUID;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
export interface DeliveryDTO {
  deliveryId: UUID;
  invoiceId: UUID;
  customerId: UUID;
  items: DeliveryItemDTO[];
  totalPrice: number;
  address: string;
  addressDetail: string;
  completed: boolean;
  status: string;
}
export async function getDeliveries(userId: UUID): Promise<DeliveryDTO[]> {
  return apiRequest<DeliveryDTO[]>(`/api/delivery/user/${userId}`);
}
