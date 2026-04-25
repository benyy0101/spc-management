import { getApiBaseUrl } from "./config";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
};

export async function apiRequest<T>(pathname: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${pathname}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}
