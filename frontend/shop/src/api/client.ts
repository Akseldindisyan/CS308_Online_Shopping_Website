const API_BASE_URL = "http://localhost:8080";

function toApiUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

async function parseErrorMessage(response: Response): Promise<string> {
    const fallbackMessage = `Request failed with status ${response.status}`;

    const toStringMessage = (value: unknown): string => {
        if (typeof value === "string") {
            return value;
        }

        if (value === null || value === undefined) {
            return "";
        }

        return String(value);
    };

    const extractValidationDetails = (data: Record<string, unknown>): string[] => {
        const details: string[] = [];

        const addDetail = (field: string, message: unknown) => {
            const text = toStringMessage(message).trim();
            if (!text) {
                return;
            }

            details.push(field ? `${field}: ${text}` : text);
        };

        const candidates = [
            data.errors,
            data.fieldErrors,
            data.validationErrors,
            data.violations,
            data.details,
        ];

        for (const candidate of candidates) {
            if (!candidate) {
                continue;
            }

            if (Array.isArray(candidate)) {
                for (const item of candidate) {
                    if (typeof item === "string") {
                        addDetail("", item);
                        continue;
                    }

                    if (item && typeof item === "object") {
                        const obj = item as Record<string, unknown>;
                        addDetail(
                            toStringMessage(obj.field ?? obj.property ?? obj.path),
                            obj.message ?? obj.error ?? obj.defaultMessage,
                        );
                    }
                }
                continue;
            }

            if (candidate && typeof candidate === "object") {
                for (const [field, value] of Object.entries(candidate as Record<string, unknown>)) {
                    if (Array.isArray(value)) {
                        for (const item of value) {
                            addDetail(field, item);
                        }
                    } else {
                        addDetail(field, value);
                    }
                }
            }
        }

        return Array.from(new Set(details));
    };

    try {
        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
            const data = (await response.json()) as Record<string, unknown>;
            const baseMessage =
                toStringMessage(data.message) ||
                toStringMessage(data.error) ||
                toStringMessage(data.title) ||
                fallbackMessage;

            const validationDetails = extractValidationDetails(data);

            if (validationDetails.length === 0) {
                return baseMessage;
            }

            return `${baseMessage}: ${validationDetails.join(" | ")}`;
        }

        const text = await response.text();
        return text || fallbackMessage;
    } catch {
        return fallbackMessage;
    }
}

export async function apiRequest<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    let response: Response;

    try {
        response = await fetch(toApiUrl(path), {
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
            ...init,
        });
    } catch {
        throw new Error(
            "Could not reach backend. Check that the API is running on http://localhost:8080 and CORS is enabled.",
        );
    }

    if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
        return (await response.json()) as T;
    }

    const text = await response.text();
    return (text as T) ?? (undefined as T);
}
