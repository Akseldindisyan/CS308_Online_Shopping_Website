import type { ProductCardDTO, ProductDetailedDTO, ProductSearchParams, UUID } from "../data/types";
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
function detailedToCard(detailed: ProductDetailedDTO): ProductCardDTO {
  return {
    id: detailed.id,
    name: detailed.name,
    category: detailed.category,
    price: detailed.price,
    stock: detailed.stock,
    active: true,
    imageUrl: detailed.image,
    rating: detailed.rating,
  };
}

const productCache = new Map<UUID, Promise<ProductCardDTO>>();

export function fetchProductById(id: UUID): Promise<ProductCardDTO> {
  const cached = productCache.get(id);
  if (cached) {
    return cached;
  }

  const promise = apiRequest<ProductDetailedDTO>(`/api/products/${id}`)
    .then(detailedToCard)
    .catch((err) => {
      productCache.delete(id);
      throw err;
    });

  productCache.set(id, promise);
  return promise;
}

export async function fetchProductsByIds(
  ids: UUID[],
): Promise<Map<UUID, ProductCardDTO>> {
  const unique = Array.from(new Set(ids));
  const results = await Promise.allSettled(
    unique.map((id) => fetchProductById(id)),
  );

  const map = new Map<UUID, ProductCardDTO>();
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      map.set(unique[index], result.value);
    }
  });
  return map;
}

export async function fetchAllProducts(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<ProductCardDTO[]> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 10),
    sort: params?.sort ?? "id",
  });
  const response = await apiRequest<SearchResponseShape>(
    `/api/products?${query.toString()}`,
    { method: "GET" },
  );
  return normalizeSearchResponse(response);
}