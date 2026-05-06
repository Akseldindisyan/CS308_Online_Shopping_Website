import { apiRequest } from "./client";
import type { UUID } from "../data/types";

export interface WishlistItem {
  productId: UUID;
  productName: string;
  price: number;
  imageUrl: string | null;
  rating: number | null;
}

export async function getWishlist(userId: UUID): Promise<WishlistItem[]> {
  return apiRequest<WishlistItem[]>(`/api/wishlist/${userId}`);
}

export async function addToWishlist(userId: UUID, productId: UUID): Promise<void> {
  await apiRequest<string>(`/api/wishlist/${userId}/${productId}`, { method: "POST" });
}

export async function removeFromWishlist(userId: UUID, productId: UUID): Promise<void> {
  await apiRequest<string>(`/api/wishlist/${userId}/${productId}`, { method: "DELETE" });
}