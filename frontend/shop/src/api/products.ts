import type { ProductCardDTO, ProductDetailedDTO, ProductSearchParams, UUID } from "../data/types";
import { apiRequest } from "./client";

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

type SearchResponseShape = ProductCardDTO[] | { content?: ProductCardDTO[] } | PageResponse<ProductCardDTO>;

function normalizeSearchResponse(data: SearchResponseShape): PageResponse<ProductCardDTO> {
  if (Array.isArray(data)) {
    return {
      content: data,
      totalPages: 1,
      totalElements: data.length,
      number: 0,
      size: data.length,
    };
  }
  if (Array.isArray(data.content)) {
    return {
      content: data.content,
      totalPages: "totalPages" in data ? (data.totalPages ?? 1) : 1,
      totalElements: "totalElements" in data ? (data.totalElements ?? data.content.length) : data.content.length,
      number: "number" in data ? (data.number ?? 0) : 0,
      size: "size" in data ? (data.size ?? data.content.length) : data.content.length,
    };
  }
  return { content: [], totalPages: 0, totalElements: 0, number: 0, size: 0 };
}

export async function searchProducts(
  params: ProductSearchParams,
): Promise<PageResponse<ProductCardDTO>> {
  const query = new URLSearchParams({
    name: params.name,
    page: String(params.page ?? 0),
    size: String(params.size ?? 10),
    sort: params.sort ?? "id",
    inStock: String(params.inStock ?? false),
  });
  if (params.category) {
    query.set("category", params.category);
  }
  const response = await apiRequest<SearchResponseShape>(
    `/api/products/search?${query.toString()}`,
    { method: "GET" },
  );
  return normalizeSearchResponse(response);
}
function detailedToCard(detailed: ProductDetailedDTO): ProductCardDTO {
  const raw = detailed as unknown as Record<string, unknown>;
  return {
    id: detailed.id,
    name: (raw.productName as string) ?? detailed.name,
    category: detailed.category,
    price: detailed.price,
    stock: detailed.stock,
    active: (raw.active as boolean) ?? true,
    imageUrl: (raw.image_url as string | null) ?? detailed.imageUrl,
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
  inStock?: boolean;
  category?: string;
}): Promise<PageResponse<ProductCardDTO>> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 10),
    sort: params?.sort ?? "id",
    inStock: String(params?.inStock ?? false),
  });
  if (params?.category) {
    query.set("category", params.category);
  }
  const response = await apiRequest<SearchResponseShape>(
    `/api/products?${query.toString()}`,
    { method: "GET" },
  );
  return normalizeSearchResponse(response);
}

export async function fetchProductCategories(): Promise<string[]> {
  return apiRequest<string[]>("/api/products/categories", { method: "GET" });
}

export interface CreateProductRequest {
  productName: string;
  price: number;
  stock: number;
  category: string;
  model?: string;
  serialNumber?: string;
  desc?: string;
  distInfo?: string;
  country?: string;
  imageUrl?: string;
  active: boolean;
  warrantyStatus?: string;
}

export async function createProduct(req: CreateProductRequest): Promise<ProductDetailedDTO> {
  return apiRequest<ProductDetailedDTO>("/api/products", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function deleteProduct(id: UUID): Promise<void> {
  return apiRequest<void>(`/api/products/${id}`, { method: "DELETE" });
}

export async function updateProductStock(id: UUID, stock: number): Promise<ProductCardDTO> {
  return apiRequest<ProductCardDTO>(`/api/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify({ stock }),
  });
}

export async function changeProductPrice(id: UUID, price: number): Promise<void> {
  return apiRequest<void>(`/api/products/${id}/price`, {
    method: "PATCH",
    body: JSON.stringify(price),
  });
}

export async function setProductActive(id: UUID, active: boolean): Promise<ProductCardDTO> {
  return apiRequest<ProductCardDTO>(`/api/products/${id}/active`, {
    method: "PATCH",
    body: JSON.stringify({ active }),
  });
}

export async function fetchAllProductsAdmin(params?: {
  page?: number;
  size?: number;
  sort?: string;
  inStock?: boolean;
}): Promise<PageResponse<ProductCardDTO>> {
  const query = new URLSearchParams({
    page: String(params?.page ?? 0),
    size: String(params?.size ?? 200),
    sort: params?.sort ?? "id",
    inStock: String(params?.inStock ?? false),
  });
  const response = await apiRequest<SearchResponseShape>(
    `/api/products/all?${query.toString()}`,
    { method: "GET" },
  );
  return normalizeSearchResponse(response);
}
