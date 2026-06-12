import { getStoredUserId } from "../api/auth";
import { apiRequest } from "../api/client";
import { fetchAllProducts } from "../api/products";
import { getOrders, type Order } from "../api/orders";
import { getWishlist, type WishlistItem } from "../api/wishlist";
import { getDeliveries, type DeliveryDTO } from "../api/delivery";

import { getUserReviews, type ReviewDTO } from "../api/reviews";
import type {
  Category,
  Comment,
  Delivery,
  Invoice,
  Product,
  ProductDetailedDTO,
  ProductCardDTO,
  WishlistEntry,
} from "./types";
export type { Category, Comment, Delivery, Invoice, Product, WishlistEntry } from "./types";
const EMPTY_DATA = {
  categories: [] as Category[],
  products: [] as Product[],
  invoices: [] as Invoice[],
  deliveries: [] as Delivery[],
  comments: [] as Comment[],
  wishlist: [] as WishlistEntry[],
};
function buildUrlFriendlyImage(product: ProductDetailedDTO | ProductCardDTO): string {
  const image = "image" in product ? product.image : product.imageUrl;
  return image ?? "";
}
function normalizeStatus(status: string, completed: boolean): Delivery["status"] {
  const normalized = status.toLowerCase();
  if (completed || normalized.includes("deliver")) return "completed";
  if (normalized.includes("delay")) return "delayed";
  if (normalized.includes("transit")) return "in-transit";
  return "preparing";
}
function safeText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
async function loadBackendData() {
  try {
    const cardsResponse = await fetchAllProducts({ page: 0, size: 1000, sort: "id", inStock: false });
    const cards = cardsResponse.content;
    const detailed = await Promise.all(
      cards.map(async (card) => {
        try {
          return await apiRequest<ProductDetailedDTO>(`/api/products/${card.id}`);
        } catch {
          return null;
        }
      }),
    );
    const productIdByUuid = new Map<string, number>();
    const categoryIdByName = new Map<string, number>();
    const products: Product[] = cards.map((card, index) => {
      const detail = detailed[index];
      const productId = card.id;
      const categoryName = safeText(card.category, detail?.category ?? "Uncategorized") || "Uncategorized";
      const categoryId = categoryIdByName.get(categoryName) ?? categoryIdByName.size + 1;
      categoryIdByName.set(categoryName, categoryId);
      productIdByUuid.set(card.id, productId);
      const imageUrl = detail ? buildUrlFriendlyImage(detail) : buildUrlFriendlyImage(card);
      const extraImages = detail?.extraImages?.filter(Boolean) ?? [];
      return {
        id: productId,
        name: detail?.name ?? card.name,
        category: categoryName,
        price: detail?.price ?? card.price,
        rating: detail?.rating ?? card.rating,
        image: imageUrl,
        images: imageUrl ? [imageUrl, ...extraImages] : [...extraImages],
        description: detail?.description ?? "",
        features: detail?.features ?? [],
        stock: detail?.stock ?? card.stock,
        categoryId,
        active: card.active,
        cost: 0,
        discountRate: detail?.discountRate,
        oldPrice: detail?.price ?? card.price,
      };
    });
    const categories = Array.from(categoryIdByName.entries())
      .map(([name, id]) => ({ id, name }))
      .sort((a, b) => a.id - b.id);
    const userId = getStoredUserId();
    const ordersPromise = userId
      ? getOrders(userId).catch(() => [] as Order[])
      : Promise.resolve([] as Order[]);
    const deliveriesPromise = userId
      ? getDeliveries(userId).catch(() => [] as DeliveryDTO[])
      : Promise.resolve([] as DeliveryDTO[]);
    const reviewsPromise = userId
      ? getUserReviews(userId).catch(() => [] as ReviewDTO[])
      : Promise.resolve([] as ReviewDTO[]);
    const wishlistPromise = userId
      ? getWishlist(userId).catch(() => [] as WishlistItem[])
      : Promise.resolve([] as WishlistItem[]);
    const [orders, deliveriesRaw, reviews, wishlistRaw] = await Promise.all([
      ordersPromise,
      deliveriesPromise,
      reviewsPromise,
      wishlistPromise,
    ]);
    const invoices: Invoice[] = orders.flatMap((order, orderIndex) =>
      order.items.map((item, itemIndex) => ({
        invoiceId: order.items.length > 1 ? `${order.invoiceId}-${itemIndex + 1}` : order.invoiceId,
        customerId: order.customerId,
        productId: productIdByUuid.get(item.productId) ?? itemIndex + 1 + orderIndex * 1000,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        date: order.date ?? "",
        paid: true,
      })),
    );
    const deliveries: Delivery[] = deliveriesRaw.flatMap((delivery) =>
      delivery.items.map((item, itemIndex) => ({
        deliveryId: delivery.items.length > 1 ? `${delivery.deliveryId}-${itemIndex + 1}` : delivery.deliveryId,
        invoiceId: delivery.invoiceId,
        customerId: delivery.customerId,
        productId: productIdByUuid.get(item.productId) ?? itemIndex + 1,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        address: delivery.address,
        addressDetail: delivery.addressDetail ?? "",
        completed: delivery.completed,
        status: normalizeStatus(delivery.status, delivery.completed),
        items: delivery.items,
      })),
    );
    const comments: Comment[] = reviews.map((review, index) => ({
      id: index + 1,
      productId: productIdByUuid.get(review.product_id) ?? index + 1,
      author: review.username,
      text: review.comment,
      rating: Math.round(review.rating),
      status: "approved",
      date: review.createdAt,
    }));
    const wishlist: WishlistEntry[] = wishlistRaw.map((item) => ({
      userId: userId ?? "",
      email: "",
      productId: productIdByUuid.get(item.productId) ?? 0,
    }));
    return { categories, products, invoices, deliveries, comments, wishlist };
  } catch (error) {
    console.error("Failed to load backend data:", error);
    return EMPTY_DATA;
  }
}
const data = await loadBackendData();
export const categories = data.categories;
export const products = data.products;
export const invoices = data.invoices;
export const deliveries = data.deliveries;
export const comments = data.comments;
export const wishlist = data.wishlist;
