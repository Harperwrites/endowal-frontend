export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type AuthToken = {
  access_token: string;
  token_type?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  name: string;
  role: "teacher" | "student";
  password: string;
};

const getToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("endowal_token");
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("endowal_token", token);
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("endowal_token");
};

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
}

export const login = async (payload: LoginPayload) => {
  return apiFetch<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const register = async (payload: RegisterPayload) => {
  return apiFetch<{ id: number }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
};

export const fetchMe = async () => {
  return apiFetch<{ id: number; name: string; email: string; role: string }>(
    "/auth/me"
  );
};
