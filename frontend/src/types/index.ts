export type Category = 'human-hair' | 'futura' | (string & {});

export type HairStyle = 'Straight' | 'Body Wave' | 'Deep Wave' | 'Curly' | 'Bob' | (string & {});

export type Availability = 'in-stock' | 'low-stock' | 'out-of-stock';

export type Badge = 'new' | 'featured' | 'bestseller' | (string & {});

export interface ColorOption {
  id?: number | string;
  name: string;
  hex: string;
  image?: string;
  stock?: number;
  price?: number;
}

export interface SizeOption {
  id?: number | string;
  name: string;
  price?: number;
  stock?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  categorySlug?: string;
  style: HairStyle;
  hairstyleSlug?: string;
  lengths: number[];
  sizes?: SizeOption[];
  colors: ColorOption[];
  laceTypes: string[];
  capTypes: string[];
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  availability: Availability;
  stock: number;
  images: string[];
  shortDescription: string;
  description: string;
  features: string[];
  specifications: {label: string;value: string;}[];
  included: string[];
  badges: Badge[];
  createdAt: string;
  popularity: number;
  reviews?: Review[];
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  length?: number;
  size?: string;
  color?: string;
  capType?: string;
  savedForLater?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  status: 'published' | 'pending' | 'hidden';
}

export type OrderStatus =
'Pending' |
'Payment Confirmed' |
'Processing' |
'Ready for Delivery' |
'Out for Delivery' |
'Delivered' |
'Cancelled' |
'Returned';

export interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  placedAt: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'Awaiting Payment' | 'Confirmed' | 'Refunded';
  items: {name: string;image: string;options: string;quantity: number;price: number;}[];
  delivery: {method: string;address: string;fee: number;};
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spend: number;
  joined: string;
  status: 'Active' | 'Disabled';
}