import type { ProductCardDTO, ProductSearchParams } from "../data/types";
import { apiRequest } from "./client";

type SearchResponseShape = ProductCardDTO[] | { content?: ProductCardDTO[] };

function normalizeSearchResponse(data: SearchResponseShape): ProductCardDTO[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  return [];
}

export async function searchProducts(
  params: ProductSearchParams,
): Promise<ProductCardDTO[]> {
  const query = new URLSearchParams({
    name: params.name,
    page: String(params.page ?? 0),
  });

  const response = await apiRequest<SearchResponseShape>(
    `/api/products/search?${query.toString()}`,
    { method: "GET" },
  );

  return normalizeSearchResponse(response);
}
