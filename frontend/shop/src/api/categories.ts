import { apiRequest } from "./client";
import type { UUID } from "../data/types";

export interface CategoryDTO {
  id: UUID;
  name: string;
}

export async function getCategories(): Promise<CategoryDTO[]> {
  return apiRequest<CategoryDTO[]>("/api/categories");
}

export async function addCategory(name: string): Promise<CategoryDTO> {
  return apiRequest<CategoryDTO>("/api/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function removeCategory(id: UUID): Promise<void> {
  return apiRequest<void>(`/api/categories/${id}`, { method: "DELETE" });
}
