import type {
    LoginRequestDTO,
    LoginResponseDTO,
    RegisterRequestDTO,
} from "../data/types";
import { apiRequest } from "./client";

export const AUTH_TOKEN_STORAGE_KEY = "authToken";
export const GUEST_TOKEN_STORAGE_KEY = "guestToken";

export async function login(
    payload: LoginRequestDTO,
): Promise<LoginResponseDTO> {
    return apiRequest<LoginResponseDTO>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function register(payload: RegisterRequestDTO): Promise<void> {
    await apiRequest<void>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function storeAuthToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getStoredAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function clearAuthToken(): void {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

export function storeGuestToken(token: string): void {
    localStorage.setItem(GUEST_TOKEN_STORAGE_KEY, token);
}

export function getStoredGuestToken(): string | null {
    return localStorage.getItem(GUEST_TOKEN_STORAGE_KEY);
}

export function clearGuestToken(): void {
    localStorage.removeItem(GUEST_TOKEN_STORAGE_KEY);
}

export async function createGuestToken(): Promise<string> {
    const response = await apiRequest<{ guestToken: string }>(
        "/api/cart/guest",
        { method: "POST" }
    );
    const token = response.guestToken;
    storeGuestToken(token);
    return token;
}

function decodeBase64Url(input: string): string {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (normalized.length % 4)) % 4;
    return atob(normalized + "=".repeat(padding));
}

function readTokenPayload(token: string): Record<string, unknown> | null {
    const parts = token.split(".");
    if (parts.length < 2) {
        return null;
    }

    try {
        return JSON.parse(decodeBase64Url(parts[1]));
    } catch {
        return null;
    }
}

export function getStoredUsername(): string | null {
    const token = getStoredAuthToken();
    if (!token) {
        return null;
    }

    const payload = readTokenPayload(token);
    const username = payload?.sub ?? payload?.username ?? payload?.name;

    return typeof username === "string" && username.trim() ? username : null;
}

export function getStoredUserId(): string | null {
    const token = getStoredAuthToken();
    if (!token) {
        return null;
    }

    const payload = readTokenPayload(token);
    const userId = payload?.userId;

    return typeof userId === "string" && userId.trim() ? userId : null;
}

export async function mergeGuestCartIntoUserCart(): Promise<void> {
    const guestToken = getStoredGuestToken();
    const userId = getStoredUserId();

    if (!guestToken || !userId) {
        return;
    }

    try {
        await apiRequest<void>("/api/cart/merge", {
            method: "POST",
            body: JSON.stringify({ guestToken, userId }),
        });
        clearGuestToken();
    } catch (error) {
        console.error("Failed to merge guest cart:", error);
    }
}
