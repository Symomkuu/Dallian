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

let csrfTokenGetter: (() => string | null) | null = null;

export function setCsrfTokenGetter(getter: () => string | null) {
  csrfTokenGetter = getter;
}

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
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add CSRF token for non-GET requests
  if (method !== 'GET' && csrfTokenGetter) {
    const token = csrfTokenGetter();
    if (token) {
      headers['X-CSRFToken'] = token;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
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
  csrfToken: string;
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

// --- Dashboard: catalog types ---

export interface DashboardCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface DashboardHairStyle {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface DashboardProductImage {
  id: number;
  product: number;
  image_url: string;
  public_id: string;
  width: number | null;
  height: number | null;
  format: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
}

export interface DashboardProduct {
  id: number;
  name: string;
  slug: string;
  category: number;
  hairstyle: number | null;
  sku: string;
  description: string;
  price: string;
  previous_price: string | null;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  images: DashboardProductImage[];
  created_at: string;
  updated_at: string;
}

export interface CloudinarySignature {
  cloud_name: string;
  api_key: string;
  timestamp: number;
  folder: string;
  public_id: string;
  signature: string;
}

// --- Dashboard: catalog endpoints ---

export function fetchDashboardCategories() {
  return get<DashboardCategory[]>('/api/dashboard/categories/');
}

export function createDashboardCategory(name: string) {
  return post<DashboardCategory>('/api/dashboard/categories/', { name });
}

export function fetchDashboardHairStyles() {
  return get<DashboardHairStyle[]>('/api/dashboard/hairstyles/');
}

export function createDashboardHairStyle(name: string) {
  return post<DashboardHairStyle>('/api/dashboard/hairstyles/', { name });
}

export function fetchDashboardProducts() {
  return get<DashboardProduct[]>('/api/dashboard/products/');
}

export function createDashboardProduct(payload: {
  name: string;
  description?: string;
  category: number;
  hairstyle?: number | null;
  sku?: string;
  price: string;
  previous_price?: string | null;
  stock_quantity: number;
  is_active?: boolean;
  is_featured?: boolean;
}) {
  return post<DashboardProduct>('/api/dashboard/products/', payload);
}

export function createDashboardProductImage(payload: {
  product: number;
  image_url: string;
  public_id?: string;
  width?: number | null;
  height?: number | null;
  format?: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}) {
  return post<DashboardProductImage>('/api/dashboard/product-images/', payload);
}

export function fetchCloudinaryUploadSignature() {
  return post<CloudinarySignature>('/api/dashboard/media/upload-signature/');
}
