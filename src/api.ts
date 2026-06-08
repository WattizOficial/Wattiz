/**
 * api.ts
 * ──────
 * Cliente HTTP centralizado da Wattiz.
 * Toda comunicação com o backend passa por aqui.
 *
 * Variável de ambiente necessária na Vercel:
 *   VITE_API_URL=https://seu-backend.railway.app
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

// ── Tokens ─────────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return localStorage.getItem("wattiz_access_token");
}

export function getRefreshToken(): string | null {
  return localStorage.getItem("wattiz_refresh_token");
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem("wattiz_access_token", access);
  localStorage.setItem("wattiz_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("wattiz_access_token");
  localStorage.removeItem("wattiz_refresh_token");
  localStorage.removeItem("wattiz_sessao");
}

// ── Fetch base com auth e refresh automático ────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token expirado → tenta refresh uma vez
  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch<T>(path, options, false);
    clearTokens();
    window.location.assign("/login");
    throw new Error("Sessão expirada.");
  }

  if (!res.ok) {
    let detail = `Erro ${res.status}`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {}
    throw new Error(detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── Tipos ───────────────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ApplianceCreate {
  name: string;
  power_watts: number;
  hours_per_day: number;
  days_per_month: number;
  category: string;
}

export interface ApplianceResponse extends ApplianceCreate {
  id: string;
  created_at: string;
  updated_at: string;
  kwh_per_month?: number;
  estimated_cost?: number;
}

export interface DashboardResponse {
  total_kwh: number;
  total_cost: number;
  active_tariff: number;
  highest_consumer: {
    appliance_id: string;
    name: string;
    category: string;
    kwh_per_month: number;
    estimated_cost: number;
    percentage_of_total: number;
  } | null;
  category_breakdown: Array<{
    category: string;
    kwh: number;
    percentage: number;
    estimated_cost: number;
  }>;
  monthly_comparison: {
    current_month: number;
    current_year: number;
    current_kwh: number;
    current_cost: number;
    previous_kwh: number | null;
    previous_cost: number | null;
    variation_percentage: number | null;
  };
  top_appliances: Array<{
    appliance_id: string;
    name: string;
    category: string;
    kwh_per_month: number;
    estimated_cost: number;
    percentage_of_total: number;
  }>;
  insights: string[];
}

export interface LumeChatResponse {
  response: string;
  context_used: Record<string, unknown>;
  model: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export const auth = {
  /** Cadastro simples (nome, email, senha) */
  async register(name: string, email: string, password: string): Promise<UserResponse> {
    return apiFetch<UserResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  /** Login OAuth2 — retorna tokens JWT */
  async login(email: string, password: string): Promise<TokenResponse> {
    // OAuth2PasswordRequestForm exige form-urlencoded
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      let detail = "E-mail ou senha incorretos.";
      try { detail = (await res.json()).detail ?? detail; } catch {}
      throw new Error(detail);
    }
    const tokens: TokenResponse = await res.json();
    saveTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  /** Perfil do usuário logado */
  me(): Promise<UserResponse> {
    return apiFetch<UserResponse>("/api/v1/auth/me");
  },

  logout() {
    clearTokens();
  },
};

// ── Usuário ─────────────────────────────────────────────────────────────────

export const users = {
  me(): Promise<UserResponse> {
    return apiFetch<UserResponse>("/api/v1/users/me");
  },

  update(data: { name?: string; email?: string }): Promise<UserResponse> {
    return apiFetch<UserResponse>("/api/v1/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteAccount(): Promise<void> {
    return apiFetch<void>("/api/v1/users/me", { method: "DELETE" });
  },
};

// ── Eletrodomésticos ─────────────────────────────────────────────────────────

export const appliances = {
  list(): Promise<ApplianceResponse[]> {
    return apiFetch<ApplianceResponse[]>("/api/v1/appliances/");
  },

  create(data: ApplianceCreate): Promise<ApplianceResponse> {
    return apiFetch<ApplianceResponse>("/api/v1/appliances/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: Partial<ApplianceCreate>): Promise<ApplianceResponse> {
    return apiFetch<ApplianceResponse>(`/api/v1/appliances/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return apiFetch<void>(`/api/v1/appliances/${id}`, { method: "DELETE" });
  },
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboard = {
  get(month?: number, year?: number): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (month) params.set("month", String(month));
    if (year) params.set("year", String(year));
    const qs = params.toString() ? `?${params}` : "";
    return apiFetch<DashboardResponse>(`/api/v1/dashboard/${qs}`);
  },
};

// ── Lume IA ──────────────────────────────────────────────────────────────────

export const lume = {
  chat(message: string, month?: number, year?: number): Promise<LumeChatResponse> {
    return apiFetch<LumeChatResponse>("/api/v1/lume/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        reference_month: month ?? null,
        reference_year: year ?? null,
      }),
    });
  },

  insights(month: number, year: number) {
    return apiFetch<{ insights: string[]; full_analysis: string }>("/api/v1/lume/insights", {
      method: "POST",
      body: JSON.stringify({ reference_month: month, reference_year: year }),
    });
  },
};

// ── Tarifas ──────────────────────────────────────────────────────────────────

export const tariffs = {
  getActive() {
    return apiFetch<{ kwh_price: number; distributor: string | null; is_active: boolean }>("/api/v1/tariffs/active");
  },

  set(value: number, flag?: string) {
    return apiFetch("/api/v1/tariffs/", {
      method: "POST",
      body: JSON.stringify({ kwh_price: value, distributor: flag ?? undefined }),
    });
  },
};

// ── Health ───────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}

/** Retorna true se o frontend tem uma URL de backend configurada */
export function hasBackend(): boolean {
  return Boolean(import.meta.env.VITE_API_URL);
}
