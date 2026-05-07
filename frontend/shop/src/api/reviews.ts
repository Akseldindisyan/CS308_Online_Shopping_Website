import { apiRequest } from "./client";
import type { UUID } from "../data/types";
export interface ReviewDTO {
  rating: number;
  id: UUID;
  username: string;
  comment: string;
  createdAt: string;
  product_id: UUID;
  product_name: string;
}
export async function getUserReviews(userId: UUID): Promise<ReviewDTO[]> {
  return apiRequest<ReviewDTO[]>(`/api/review/user/${userId}`);
}
export async function getProductReviews(productId: UUID): Promise<ReviewDTO[]> {
  return apiRequest<ReviewDTO[]>(`/api/review/product/${productId}`);
}
