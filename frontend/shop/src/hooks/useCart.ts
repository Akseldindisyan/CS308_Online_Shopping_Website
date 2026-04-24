import { useCallback, useEffect, useState } from "react";
import type { CartDTO, EnrichedCartItem, InvoiceDTO, UUID } from "../data/types";
import {
    addItemToCart,
    checkoutCart,
    fetchCart,
    removeItemFromCart,
    updateItemQuantity,
} from "../api/cart";
import { fetchProductsByIds } from "../api/products";

interface UseCartResult {
    cart: CartDTO | null;
    items: EnrichedCartItem[];
    loading: boolean;
    productsLoading: boolean;
    error: string | null;
    mutating: boolean;
    addItem: (productId: UUID, quantity?: number) => Promise<void>;
    removeItem: (productId: UUID) => Promise<void>;
    changeQuantity: (productId: UUID, newQuantity: number) => Promise<void>;
    checkout: () => Promise<
        { ok: true; invoice: InvoiceDTO } | { ok: false; message: string }
    >;

    refresh: () => Promise<void>;
}

export function useCart(): UseCartResult {
    const [cart, setCart] = useState<CartDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mutating, setMutating] = useState(false);
    const [productMap, setProductMap] = useState<Map<UUID, { imageUrl: string | null; category: string; stock: number }>>(new Map());
    const [productsLoading, setProductsLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCart();
            setCart(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load cart");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Fetch product details whenever the set of product ids in the cart changes
    const cartItems = cart?.items ?? [];
    const productIdsKey = cartItems
        .map((item) => item.productId)
        .sort()
        .join(",");

    useEffect(() => {
        if (cartItems.length === 0) {
            setProductMap(new Map());
            return;
        }

        let cancelled = false;
        setProductsLoading(true);

        fetchProductsByIds(cartItems.map((item: { productId: any; }) => item.productId))
            .then((map) => {
                if (cancelled) return;
                const slim = new Map<UUID, { imageUrl: string | null; category: string; stock: number }>();
                map.forEach((product, id) => {
                    slim.set(id, {
                        imageUrl: product.imageUrl,
                        category: product.category,
                        stock: product.stock,
                    });
                });
                setProductMap(slim);
            })
            .finally(() => {
                if (!cancelled) setProductsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productIdsKey]);

    const runMutation = useCallback(
        async (mutation: () => Promise<CartDTO | void>) => {
            setMutating(true);
            setError(null);
            try {
                const result = await mutation();
                if (result) {
                    setCart(result);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Cart update failed",
                );
            } finally {
                setMutating(false);
            }
        },
        [],
    );

    const addItem = useCallback(
        async (productId: UUID, quantity: number = 1) => {
            await runMutation(() => addItemToCart(productId, quantity));
        },
        [runMutation],
    );

    const removeItem = useCallback(
        async (productId: UUID) => {
            await runMutation(() => removeItemFromCart(productId));
        },
        [runMutation],
    );

    const changeQuantity = useCallback(
        async (productId: UUID, newQuantity: number) => {
            await runMutation(() =>
                updateItemQuantity(productId, newQuantity)
            );
        },
        [runMutation],
    );

    const checkout = useCallback(async (): Promise<
        { ok: true; invoice: InvoiceDTO } | { ok: false; message: string }
    > => {
        setMutating(true);
        setError(null);
        try {
            const invoice = await checkoutCart();
            // Backend has cleared the cart server-side; refresh our local state
            await refresh();
            return { ok: true, invoice };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Checkout failed";
            setError(message);
            return { ok: false, message };
        } finally {
            setMutating(false);
        }
    }, [refresh]);

    const enrichedItems: EnrichedCartItem[] = cartItems.map((item) => {
        const product = productMap.get(item.productId);
        return {
            ...item,
            imageUrl: product?.imageUrl ?? null,
            category: product?.category ?? null,
            stock: product?.stock ?? null,
        };
    });

    return {
        cart,
        items: enrichedItems,
        loading,
        productsLoading,
        error,
        mutating,
        addItem,
        removeItem,
        changeQuantity,
        checkout,
        refresh,
    };
}