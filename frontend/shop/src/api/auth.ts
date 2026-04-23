import type {
    LoginRequestDTO,
    LoginResponseDTO,
    RegisterRequestDTO,
} from "../data/types";
import { apiRequest } from "./client";

export const AUTH_TOKEN_STORAGE_KEY = "authToken";

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
