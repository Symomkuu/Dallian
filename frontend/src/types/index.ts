export type Category = 'human-hair' | 'futura';

export type HairStyle = 'Straight' | 'Body Wave' | 'Deep Wave' | 'Curly' | 'Bob';

export type Availability = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  style: HairStyle;
  lengths: number[];
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
  badges: ('new' | 'featured' | 'bestseller')[];
  createdAt: string;
  popularity: number;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  length: number;
  color: string;
  capType: string;
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