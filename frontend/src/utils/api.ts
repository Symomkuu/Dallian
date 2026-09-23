/**
 * Thin client for the Dallian Django backend.
 *
 * Auth is cookie based (HttpOnly JWT cookies set by the backend), so every
 * request must be sent with `credentials: 'include'`. There is no bearer
 * token to store in JS — the browser handles that via cookies automatically.
 */

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

export interface ApiErrorPayload {
  detail?: string;
  code?: string;
  message?: string;
  [field: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  payload: ApiErrorPayload;

  constructor(status: number, payload: ApiErrorPayload) {
    super(
      payload?.detail ||
        payload?.message ||
        firstFieldError(payload) ||
        'Something went wrong. Please try again.'
    );
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload ?? {};
  }
}

/** DRF field errors look like `{ email: ["This field is required."] }`. */
function firstFieldError(payload: ApiErrorPayload | null | undefined): string | null {
  if (!payload) return null;
  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  }
  return null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data ?? {});
  }
  return data as T;
}

function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

// --- Types returned by the backend ---

export type UserRole = 'customer' | 'staff';

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone: string;
  delivery_address: string;
  notify_order_updates: boolean;
  notify_promotions_and_deals: boolean;
  is_email_verified: boolean;
  created_at: string;
}

interface MessageResponse {
  message: string;
  csrfToken?: string;
}

// --- Auth endpoints ---

export function registerCustomer(payload: {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return post<{ email: string; message: string }>('/api/auth/register/', payload);
}

export function verifyEmail(payload: { email: string; code: string }) {
  return post<MessageResponse>('/api/auth/verify-email/', payload);
}

export function resendVerificationCode(payload: { email: string }) {
  return post<MessageResponse>('/api/auth/resend-code/', payload);
}

/** Logs in a customer or a staff member alike; the backend decides the role. */
export function login(payload: { email: string; password: string }) {
  return post<MessageResponse>('/api/auth/login/', payload);
}

export function logout() {
  return post<MessageResponse>('/api/auth/logout/');
}

export function fetchCurrentUser() {
  return get<AuthUser>('/api/auth/me/');
}

export function updateCurrentUser(payload: Partial<AuthUser>) {
  return patch<AuthUser>('/api/auth/me/', payload);
}

export function forgotPassword(payload: { email: string }) {
  return post<MessageResponse>('/api/auth/password/forgot/', payload);
}

export function resetPassword(payload: { email: string; code: string; new_password: string }) {
  return post<MessageResponse>('/api/auth/password/reset/', payload);
}
