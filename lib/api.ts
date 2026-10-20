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

let sessionVersion = 0;
const getToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("endowal_token");
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  sessionVersion++;
  window.localStorage.setItem("endowal_token", token);
  window.dispatchEvent(new Event("endowal-session"));
};

export const clearToken = () => {
  if (typeof window === "undefined") return;
  sessionVersion++;
  const hadToken = Boolean(window.localStorage.getItem("endowal_token"));
  window.localStorage.removeItem("endowal_token");
  if (hadToken) window.dispatchEvent(new Event("endowal-session"));
};

let renewing: Promise<string | null> | null = null;
async function renewSession(): Promise<string | null> {
  if (!renewing) renewing = (async () => {
    const version = sessionVersion;
    const response = await fetch(`${API_BASE}/auth/refresh`, {method:"POST", credentials:"include"});
    if (!response.ok) return null;
    const data = await response.json() as AuthToken;
    if (version !== sessionVersion) return null;
    localStorage.setItem("endowal_token", data.access_token);
    return data.access_token;
  })().finally(() => { renewing = null; });
  return renewing;
}

export async function signOut() {
  const response = await fetch(`${API_BASE}/auth/logout`, {method:"POST", credentials:"include"});
  if (!response.ok) throw new Error("Could not sign out. Please try again.");
  clearToken();
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const send = () => fetch(`${API_BASE}${path}`, {...init, headers, credentials:"include", cache:"no-store"});
  let response = await send();
  if (response.status === 401 && !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].includes(path)) {
    const renewed = await renewSession();
    if (renewed) { headers.set("Authorization", `Bearer ${renewed}`); response = await send(); }
    else if (getToken() === token) clearToken();
  }
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
