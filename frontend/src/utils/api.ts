/**
 * Thin client for the Dallian Django backend.
 *
 * Auth is cookie based (HttpOnly JWT cookies set by the backend), so every
 * request must be sent with `credentials: 'include'`. There is no bearer
 * token to store in JS — the browser handles that via cookies automatically.
 */

import type { Product, Category, HairStyle, Review } from '@/types';

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

let csrfTokenSetter: ((token: string) => void) | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export function setCsrfTokenSetter(setter: ((token: string) => void) | null) {
  csrfTokenSetter = setter;
}

export function getCsrfToken(): string | null {
  if (csrfTokenGetter) {
    const token = csrfTokenGetter();
    if (token) return token;
  }
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return null;
}

export function fetchCsrfToken() {
  return get<{ csrfToken: string }>('/api/auth/csrf/');
}

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data?.csrfToken && csrfTokenSetter) {
          csrfTokenSetter(data.csrfToken);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Add CSRF token for non-GET requests
  if (method !== 'GET') {
    let token = getCsrfToken();
    if (!token && !path.includes('/api/auth/csrf')) {
      try {
        const csrfRes = await fetch(`${API_BASE_URL}/api/auth/csrf/`, {
          credentials: 'include',
        });
        if (csrfRes.ok) {
          const csrfData = await csrfRes.json();
          if (csrfData?.csrfToken) {
            token = csrfData.csrfToken;
            if (csrfTokenSetter && token) csrfTokenSetter(token);
          }
        }
      } catch {
        // ignore network error on csrf prefetch
      }
    }
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
    if (
      response.status === 401 &&
      !path.includes('/api/auth/refresh') &&
      !path.includes('/api/auth/login') &&
      !path.includes('/api/auth/register')
    ) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const retryHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string>),
        };
        if (method !== 'GET') {
          const token = getCsrfToken();
          if (token) retryHeaders['X-CSRFToken'] = token;
        }
        const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          credentials: 'include',
          headers: retryHeaders,
        });
        const retryText = await retryResponse.text();
        const retryData = retryText ? JSON.parse(retryText) : null;
        if (retryResponse.ok) {
          return retryData as T;
        }
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      }
    }
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

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
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

export interface MessageResponse {
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

export function loginWithGoogle(payload: { credential: string }) {
  return post<MessageResponse & { created?: boolean }>('/api/auth/google/', payload);
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

export interface StoreProductColor {
  id: number;
  name: string;
  hex_code: string;
  image?: number | null;
  image_url?: string | null;
  price: string | null;
  stock_quantity: number;
  sort_order: number;
  is_active: boolean;
}

export interface StoreProductSize {
  id: number;
  name: string;
  price: string | null;
  stock_quantity: number;
  sort_order: number;
  is_active: boolean;
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
  colors?: StoreProductColor[];
  sizes?: StoreProductSize[];
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

export function fetchDashboardProduct(id: number | string) {
  return get<DashboardProduct>(`/api/dashboard/products/${id}/`);
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
  colors?: {
    name: string;
    hex_code?: string;
    image?: number | null;
    image_url?: string | null;
    stock_quantity?: number;
    price?: string | null;
    sort_order?: number;
    is_active?: boolean;
  }[];
  sizes?: {
    name: string;
    price?: string | null;
    stock_quantity?: number;
    sort_order?: number;
    is_active?: boolean;
  }[];
}) {
  return post<DashboardProduct>('/api/dashboard/products/', payload);
}

export function updateDashboardProduct(
  id: number | string,
  payload: {
    name?: string;
    description?: string;
    category?: number;
    hairstyle?: number | null;
    sku?: string;
    price?: string;
    previous_price?: string | null;
    stock_quantity?: number;
    is_active?: boolean;
    is_featured?: boolean;
    colors?: {
      name: string;
      hex_code?: string;
      image?: number | null;
      image_url?: string | null;
      stock_quantity?: number;
      price?: string | null;
      sort_order?: number;
      is_active?: boolean;
    }[];
    sizes?: {
      name: string;
      price?: string | null;
      stock_quantity?: number;
      sort_order?: number;
      is_active?: boolean;
    }[];
  }
) {
  return patch<DashboardProduct>(`/api/dashboard/products/${id}/`, payload);
}

export function deleteDashboardProduct(id: number | string) {
  return del<void>(`/api/dashboard/products/${id}/`);
}

export function createDashboardProductColor(payload: {
  product: number;
  name: string;
  hex_code?: string;
  image?: number | null;
  image_url?: string | null;
  stock_quantity?: number;
  price?: string | null;
  sort_order?: number;
  is_active?: boolean;
}) {
  return post<StoreProductColor>('/api/dashboard/product-colors/', payload);
}

export function createDashboardProductSize(payload: {
  product: number;
  name: string;
  price?: string | null;
  stock_quantity?: number;
  sort_order?: number;
  is_active?: boolean;
}) {
  return post<StoreProductSize>('/api/dashboard/product-sizes/', payload);
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

export function deleteDashboardProductImage(id: number | string) {
  return del<void>(`/api/dashboard/product-images/${id}/`);
}

export function setPrimaryDashboardProductImage(id: number | string) {
  return post<DashboardProductImage>(`/api/dashboard/product-images/${id}/set-primary/`);
}

export function fetchCloudinaryUploadSignature() {
  return post<CloudinarySignature>('/api/dashboard/media/upload-signature/');
}

// --- Storefront: catalog types ---

export interface StoreCategory {
  id: number;
  name: string;
  slug: string;
  image_url: string;
}

export interface StoreHairStyle {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
}

export interface StoreProductImage {
  id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface StoreProductListItem {
  id: number;
  name: string;
  slug: string;
  category: StoreCategory;
  hairstyle: StoreHairStyle | null;
  price: string;
  previous_price: string | null;
  primary_image: StoreProductImage | null;
  in_stock: boolean;
  stock_quantity?: number;
  is_featured: boolean;
  rating?: number;
  review_count?: number;
  colors?: StoreProductColor[];
  sizes?: StoreProductSize[];
}

export interface StoreReview {
  id: number;
  author_name: string;
  location?: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_buyer?: boolean;
  created_at?: string;
}

export interface StoreProductDetail extends StoreProductListItem {
  description: string;
  sku: string;
  images: StoreProductImage[];
  reviews?: StoreReview[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FetchProductsParams {
  category?: string;
  hairstyle?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  featured?: boolean;
  q?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Normalizes image URLs so localhost/relative paths resolve accurately.
 */
export function cleanImageUrl(url: string | undefined | null): string {
  if (!url) return '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg';
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
}

/**
 * Transforms a backend StoreProductListItem or StoreProductDetail into the rich
 * frontend Product model required by UI components.
 */
export function formatProductFromBackend(
  item: StoreProductListItem | StoreProductDetail
): Product {
  const detailImages =
    'images' in item && Array.isArray(item.images) && item.images.length > 0
      ? item.images.map((img) => cleanImageUrl(img.image_url))
      : [];

  const primary = item.primary_image?.image_url
    ? [cleanImageUrl(item.primary_image.image_url)]
    : [];

  const images =
    detailImages.length > 0
      ? detailImages
      : primary.length > 0
        ? primary
        : ['/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg'];

  const badges: ('new' | 'featured' | 'bestseller')[] = [];
  if (item.is_featured) badges.push('featured');

  const priceNum = parseFloat(item.price) || 0;
  const compareAtPriceNum = item.previous_price ? parseFloat(item.previous_price) : undefined;
  const desc = ('description' in item && item.description ? item.description : '').trim();

  const colors =
    item.colors && item.colors.length > 0
      ? item.colors.map((c) => ({
          id: c.id,
          name: c.name,
          hex: c.hex_code || '#000000',
          image: c.image_url ? cleanImageUrl(c.image_url) : undefined,
          stock: c.stock_quantity,
          price: c.price ? parseFloat(c.price) : undefined,
        }))
      : [];

  const sizes =
    item.sizes && item.sizes.length > 0
      ? item.sizes.map((s) => ({
          id: s.id,
          name: s.name,
          price: s.price ? parseFloat(s.price) : undefined,
          stock: s.stock_quantity,
        }))
      : undefined;

  const lengthsFromSizes = sizes
    ? sizes
        .map((s) => {
          const match = s.name.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        })
        .filter((n) => n > 0)
    : [];

  const lengths = lengthsFromSizes;

  const stockCount =
    typeof item.stock_quantity === 'number'
      ? item.stock_quantity
      : item.in_stock
        ? 10
        : 0;

  const availability: 'in-stock' | 'low-stock' | 'out-of-stock' =
    stockCount === 0 ? 'out-of-stock' : stockCount <= 5 ? 'low-stock' : 'in-stock';

  const specifications: { label: string; value: string }[] = [];
  if (item.category?.name) {
    specifications.push({ label: 'Category', value: item.category.name });
  }
  if (item.hairstyle?.name) {
    specifications.push({ label: 'Texture', value: item.hairstyle.name });
  }
  if ('sku' in item && item.sku) {
    specifications.push({ label: 'SKU', value: item.sku });
  }

  const rawReviews = 'reviews' in item && Array.isArray(item.reviews) ? item.reviews : [];
  const parsedReviews: Review[] = rawReviews.map((r) => ({
    id: String(r.id),
    productId: String(item.id),
    author: r.author_name || 'Verified Customer',
    location: r.location || '',
    rating: r.rating || 5,
    title: r.title || '',
    body: r.comment || '',
    date: r.created_at || new Date().toISOString(),
    verified: Boolean(r.is_verified_buyer),
    status: 'published' as const,
  }));

  const ratingNum =
    typeof item.rating === 'number'
      ? item.rating
      : parsedReviews.length > 0
        ? Number((parsedReviews.reduce((sum, r) => sum + r.rating, 0) / parsedReviews.length).toFixed(1))
        : 0;

  const reviewCountNum =
    typeof item.review_count === 'number' ? item.review_count : parsedReviews.length;

  return {
    id: String(item.id),
    slug: item.slug,
    name: item.name,
    category: (item.category?.name || item.category?.slug || 'Hair') as Category,
    categorySlug: item.category?.slug,
    style: (item.hairstyle?.name || '') as HairStyle,
    hairstyleSlug: item.hairstyle?.slug,
    lengths,
    sizes,
    colors,
    laceTypes: [],
    capTypes: [],
    price: priceNum,
    compareAtPrice: compareAtPriceNum,
    rating: ratingNum,
    reviewCount: reviewCountNum,
    reviews: parsedReviews,
    availability,
    stock: stockCount,
    images,
    shortDescription: desc ? desc.slice(0, 120) : '',
    description: desc,
    features: [],
    specifications,
    included: [],
    badges,
    createdAt: new Date().toISOString(),
    popularity: item.is_featured ? 95 : 80,
  };
}

// --- Storefront: catalog endpoints ---

export function fetchStoreProducts(params: FetchProductsParams = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.hairstyle) query.set('hairstyle', params.hairstyle);
  if (params.min_price != null) query.set('min_price', String(params.min_price));
  if (params.max_price != null) query.set('max_price', String(params.max_price));
  if (params.in_stock) query.set('in_stock', 'true');
  if (params.featured) query.set('featured', 'true');
  if (params.q) query.set('q', params.q);
  if (params.ordering) query.set('ordering', params.ordering);
  if (params.page) query.set('page', String(params.page));
  if (params.page_size) query.set('page_size', String(params.page_size));

  const qs = query.toString();
  return get<PaginatedResponse<StoreProductListItem>>(`/api/store/products/${qs ? `?${qs}` : ''}`);
}

export function fetchStoreFeaturedProducts() {
  return fetchStoreProducts({ featured: true, page_size: 12 });
}

export function fetchStoreProductDetail(slug: string) {
  return get<StoreProductDetail>(`/api/store/products/${slug}/`);
}

export function fetchStoreCategories() {
  return get<StoreCategory[]>('/api/store/categories/');
}

export function fetchStoreHairStyles() {
  return get<StoreHairStyle[]>('/api/store/hairstyles/');
}

export function createStoreProductReview(
  slug: string,
  payload: {
    author_name: string;
    location?: string;
    rating: number;
    title?: string;
    comment: string;
  }
) {
  return post<StoreReview>(`/api/store/products/${slug}/reviews/`, payload);
}

// --- Orders endpoints (Guests & Members) ---

export interface CheckoutItemPayload {
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  size?: string;
  color?: string;
  length?: number;
  cap_type?: string;
  price?: number;
}

export interface CreateOrderPayload {
  name: string;
  email: string;
  phone: string;
  delivery_method: string;
  address?: string;
  city?: string;
  delivery_fee: number;
  payment_method: 'mpesa' | 'card' | 'cash_on_delivery';
  notes?: string;
  discount_code?: string;
  items: CheckoutItemPayload[];
}

export interface BackendOrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_image: string;
  selected_size: string;
  selected_color: string;
  selected_length: number | null;
  selected_cap_type: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

export interface BackendOrderDetail {
  id: number;
  order_number: string;
  is_guest: boolean;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_method: string;
  delivery_address: string;
  delivery_city: string;
  delivery_fee: string;
  subtotal: string;
  discount_code: string;
  discount_amount: string;
  total_amount: string;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  payment_method: string;
  payment_method_display: string;
  payment_reference: string;
  customer_notes: string;
  staff_notes: string;
  items: BackendOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface BackendOrderListItem {
  id: number;
  order_number: string;
  is_guest: boolean;
  customer_name: string;
  customer_phone: string;
  delivery_method: string;
  total_amount: string;
  status: string;
  status_display: string;
  payment_status: string;
  payment_status_display: string;
  item_count: number;
  created_at: string;
}

/** Places an order for either a guest or an authenticated customer. */
export function createOrder(payload: CreateOrderPayload) {
  return post<BackendOrderDetail>('/api/orders/checkout/', payload);
}

/** Fetches orders for the logged-in user. */
export function fetchMyOrders() {
  return get<BackendOrderListItem[]>('/api/orders/my-orders/');
}

/** Public tracking for guest orders by order number + contact info. */
export function trackOrder(orderNumber: string, contact?: string) {
  const query = new URLSearchParams({ order_number: orderNumber });
  if (contact) query.set('contact', contact);
  return get<BackendOrderDetail>(`/api/orders/track/?${query.toString()}`);
}

/** Fetches single order details by its order number. */
export function fetchOrderDetail(orderNumber: string) {
  return get<BackendOrderDetail>(`/api/orders/${orderNumber}/`);
}

// ── Admin order management ────────────────────────────────────────────────────

export interface AdminOrderListParams {
  status?: string;
  payment_status?: string;
  q?: string;
}

/** Admin: list all orders with optional filtering/search. */
export function adminFetchOrders(params: AdminOrderListParams = {}) {
  const query = new URLSearchParams();
  if (params.status)         query.set('status', params.status);
  if (params.payment_status) query.set('payment_status', params.payment_status);
  if (params.q)              query.set('q', params.q);
  const qs = query.toString();
  return get<BackendOrderListItem[]>(`/api/orders/admin/list/${qs ? `?${qs}` : ''}`);
}

/** Admin: full order detail by numeric ID. */
export function adminFetchOrderDetail(id: number) {
  return get<BackendOrderDetail>(`/api/orders/admin/${id}/`);
}

export interface AdminOrderUpdate {
  status?: string;
  payment_status?: string;
  payment_reference?: string;
  staff_notes?: string;
}

/** Admin: update order status / payment / notes (PATCH). */
export function adminUpdateOrder(id: number, data: AdminOrderUpdate) {
  return patch<BackendOrderDetail>(`/api/orders/admin/${id}/`, data);
}

export interface AdminStats {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  delivered_orders: number;
  total_customers: number;
  total_products: number;
}

/** Admin: summary metrics of revenue, orders, customers, and products. */
export function adminFetchStats() {
  return get<AdminStats>('/api/orders/admin/stats/');
}

export interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/** Sends public contact form message to dallianltd@gmail.com */
export function sendContactEnquiry(payload: ContactPayload) {
  return post<{ message: string }>('/api/contact/', payload);
}

