import { apiRequest } from "./client";
import type { UUID, Delivery, DeliveryStatus } from "../data/types";

export async function getDeliveries(userId: UUID): Promise<Delivery[]> {
    return apiRequest<Delivery[]>(`/api/delivery/user/${userId}`);
}

export async function updateDeliveryStatus(
    deliveryId: UUID,
    status: DeliveryStatus
): Promise<Delivery> {
    return apiRequest<Delivery>(`/api/delivery/${deliveryId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export async function getAllDeliveries(): Promise<Delivery[]> {
    return apiRequest<Delivery[]>(`/api/delivery`);
}