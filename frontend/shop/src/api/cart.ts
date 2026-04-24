import type {
    CartDTO,
    CartItemRequestDTO,
    InvoiceDTO,
    UUID,
} from "../data/types";
import { apiRequest } from "./client";
import {
    createGuestToken,
    getStoredAuthToken,
    getStoredGuestToken,
    getStoredUserId,
} from "./auth";

async function resolveCartIdentity(): Promise<{ kind: "user"; userId: UUID } |
{ kind: "guest"; guestToken: string }> {
    const authToken = getStoredAuthToken();
    const userId = getStoredUserId();

    if (authToken && userId) {
        return { kind: "user", userId };
    }

    let guestToken = getStoredGuestToken();
    if (!guestToken) {
        guestToken = await createGuestToken();
    }
    return { kind: "guest", guestToken };
}

export async function fetchCart(): Promise<CartDTO> {
    const identity = await resolveCartIdentity();

    if (identity.kind === "user") {
        return apiRequest<CartDTO>(`/api/cart/user/${identity.userId}`);
    }
    return apiRequest<CartDTO>(`/api/cart/guest/${identity.guestToken}`);
}

export async function addItemToCart(
    productId: UUID,
    quantity: number = 1,
): Promise<CartDTO> {
    const identity = await resolveCartIdentity();
    const body: CartItemRequestDTO = { productId, quantity };

    if (identity.kind === "user") {
        return apiRequest<CartDTO>(`/api/cart/user/${identity.userId}/items`, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }
    return apiRequest<CartDTO>(
        `/api/cart/guest/${identity.guestToken}/items`,
        {
            method: "POST",
            body: JSON.stringify(body),
        },
    );
}

export async function removeItemFromCart(productId: UUID): Promise<CartDTO> {
    const identity = await resolveCartIdentity();

    if (identity.kind === "user") {
        return apiRequest<CartDTO>(
            `/api/cart/user/${identity.userId}/items/${productId}`,
            { method: "DELETE" },
        );
    }
    return apiRequest<CartDTO>(
        `/api/cart/guest/${identity.guestToken}/items/${productId}`,
        { method: "DELETE" },
    );
}


export async function updateItemQuantity(
    productId: UUID,
    newQuantity: number,
): Promise<CartDTO> {
    const afterDelete = await removeItemFromCart(productId);
    if (newQuantity <= 0) {
        return afterDelete;
    }
    return addItemToCart(productId, newQuantity);
}

export async function checkoutCart(): Promise<InvoiceDTO> {
    const authToken = getStoredAuthToken();
    const userId = getStoredUserId();

    if (!authToken || !userId) {
        throw new Error("Please log in to complete your purchase.");
    }

    // Fetch the latest cart so we send the server's source of truth
    const cart = await fetchCart();
    if (cart.items.length === 0) {
        throw new Error("Your cart is empty.");
    }

    return apiRequest<InvoiceDTO>(`/api/checkout`, {
        method: "POST",
        body: JSON.stringify(cart),
    });
}