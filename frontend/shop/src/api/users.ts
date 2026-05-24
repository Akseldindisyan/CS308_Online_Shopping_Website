import type { UserDTO } from "../data/types";
import { apiRequest } from "./client";

export type UserProfilePayload = Omit<UserDTO, "id" | "username">;

export async function getCurrentUser(): Promise<UserDTO> {
    return apiRequest<UserDTO>("/api/users/me");
}

export async function updateCurrentUser(
    payload: UserProfilePayload,
): Promise<UserDTO> {
    return apiRequest<UserDTO>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}
