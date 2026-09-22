import type { Customer, Order } from '../types';

const IMG_BODY = "/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg";

const IMG_BOB = "/f1194d78-3143-40b7-8077-cc62ea396e67.jpg";
const IMG_HD = "/40609846-8a62-42e1-acfb-284505ec078e.jpg";
const IMG_CURLY = "/f9c35955-16ca-4e72-b5b6-36d9dac86f93.jpg";


export const orders: Order[] = [
{
  id: 'DLH-24081',
  customer: 'Wanjiru Mwangi',
  phone: '0722 000 111',
  email: 'wanjiru@example.com',
  placedAt: '2026-09-17',
  total: 26000,
  status: 'Out for Delivery',
  paymentMethod: 'M-Pesa',
  paymentStatus: 'Confirmed',
  items: [
  { name: 'Luxury Body Wave', image: IMG_BODY, options: '20" · Rich Chestnut · Lace Front', quantity: 1, price: 24500 }],

  delivery: { method: 'Nairobi Delivery', address: 'Kilimani, Nairobi', fee: 500 }
},
{
  id: 'DLH-24080',
  customer: 'Achieng Otieno',
  phone: '0733 222 333',
  email: 'achieng@example.com',
  placedAt: '2026-09-17',
  total: 12400,
  status: 'Payment Confirmed',
  paymentMethod: 'Card',
  paymentStatus: 'Confirmed',
  items: [{ name: 'Glueless Bob', image: IMG_BOB, options: '12" · Natural Black', quantity: 1, price: 12400 }],
  delivery: { method: 'Courier — Kisumu', address: 'Milimani, Kisumu', fee: 700 }
},
{
  id: 'DLH-24079',
  customer: 'Faith Kamau',
  phone: '0711 444 555',
  email: 'faith@example.com',
  placedAt: '2026-09-16',
  total: 31500,
  status: 'Processing',
  paymentMethod: 'M-Pesa',
  paymentStatus: 'Confirmed',
  items: [{ name: 'HD Lace Frontal', image: IMG_HD, options: '24" · Natural Black', quantity: 1, price: 31500 }],
  delivery: { method: 'Store Collection', address: 'Mountain Mall, Thika Road', fee: 0 }
},
{
  id: 'DLH-24078',
  customer: 'Amina Hassan',
  phone: '0700 666 777',
  email: 'amina@example.com',
  placedAt: '2026-09-15',
  total: 29800,
  status: 'Delivered',
  paymentMethod: 'M-Pesa',
  paymentStatus: 'Confirmed',
  items: [
  { name: 'Elegant Curly', image: IMG_CURLY, options: '16" · Honey Gold', quantity: 2, price: 14900 }],

  delivery: { method: 'Courier — Mombasa', address: 'Nyali, Mombasa', fee: 0 }
},
{
  id: 'DLH-24077',
  customer: 'Njeri Wachira',
  phone: '0755 888 999',
  email: 'njeri@example.com',
  placedAt: '2026-09-14',
  total: 24500,
  status: 'Pending',
  paymentMethod: 'M-Pesa',
  paymentStatus: 'Awaiting Payment',
  items: [{ name: 'Luxury Body Wave', image: IMG_BODY, options: '18" · Natural Black', quantity: 1, price: 24500 }],
  delivery: { method: 'Nairobi Delivery', address: 'Westlands, Nairobi', fee: 500 }
},
{
  id: 'DLH-24076',
  customer: 'Grace Mutiso',
  phone: '0788 121 212',
  email: 'grace@example.com',
  placedAt: '2026-09-12',
  total: 14900,
  status: 'Returned',
  paymentMethod: 'Card',
  paymentStatus: 'Refunded',
  items: [{ name: 'Elegant Curly', image: IMG_CURLY, options: '14" · Rich Chestnut', quantity: 1, price: 14900 }],
  delivery: { method: 'Nairobi Delivery', address: 'Karen, Nairobi', fee: 500 }
}];


export const customers: Customer[] = [
{ id: 'CU-1041', name: 'Wanjiru Mwangi', email: 'wanjiru@example.com', phone: '0722 000 111', orders: 4, spend: 96500, joined: '2026-02-11', status: 'Active' },
{ id: 'CU-1040', name: 'Achieng Otieno', email: 'achieng@example.com', phone: '0733 222 333', orders: 2, spend: 26800, joined: '2026-04-02', status: 'Active' },
{ id: 'CU-1039', name: 'Faith Kamau', email: 'faith@example.com', phone: '0711 444 555', orders: 3, spend: 71200, joined: '2026-05-19', status: 'Active' },
{ id: 'CU-1038', name: 'Amina Hassan', email: 'amina@example.com', phone: '0700 666 777', orders: 5, spend: 118400, joined: '2025-12-07', status: 'Active' },
{ id: 'CU-1037', name: 'Njeri Wachira', email: 'njeri@example.com', phone: '0755 888 999', orders: 1, spend: 24500, joined: '2026-09-01', status: 'Active' },
{ id: 'CU-1036', name: 'Grace Mutiso', email: 'grace@example.com', phone: '0788 121 212', orders: 2, spend: 29800, joined: '2026-03-23', status: 'Disabled' }];


export const salesSeries = [
{ month: 'Mar', sales: 318000, orders: 14 },
{ month: 'Apr', sales: 402000, orders: 18 },
{ month: 'May', sales: 366000, orders: 16 },
{ month: 'Jun', sales: 488000, orders: 22 },
{ month: 'Jul', sales: 541000, orders: 25 },
{ month: 'Aug', sales: 612000, orders: 29 },
{ month: 'Sep', sales: 704000, orders: 33 }];


export const topProducts = [
{ name: 'Luxury Body Wave', units: 42 },
{ name: 'Silky Straight', units: 35 },
{ name: 'Glueless Bob', units: 28 },
{ name: 'Elegant Curly', units: 24 },
{ name: 'HD Lace Frontal', units: 17 }];


export const categorySplit = [
{ name: 'Premium Human Hair', value: 64 },
{ name: 'Japanese Futura', value: 36 }];


export const activitySeries = [
{ day: 'Mon', visits: 320, addToCart: 48 },
{ day: 'Tue', visits: 412, addToCart: 61 },
{ day: 'Wed', visits: 388, addToCart: 55 },
{ day: 'Thu', visits: 470, addToCart: 72 },
{ day: 'Fri', visits: 602, addToCart: 96 },
{ day: 'Sat', visits: 688, addToCart: 118 },
{ day: 'Sun', visits: 401, addToCart: 57 }];


export const wishlistAnalytics = [
{ name: 'HD Lace Frontal', saves: 86, conversions: 19 },
{ name: 'Luxury Body Wave', saves: 74, conversions: 31 },
{ name: 'Deep Wave', saves: 52, conversions: 12 },
{ name: 'Glueless Bob', saves: 47, conversions: 21 }];


export const adminMessages = [
{ id: 'MSG-208', name: 'Mercy Njoki', subject: 'Colour match for 22 inch body wave', received: '2026-09-18', status: 'Unread' },
{ id: 'MSG-207', name: 'Brenda A.', subject: 'Do you install in store?', received: '2026-09-17', status: 'Unread' },
{ id: 'MSG-206', name: 'Halima S.', subject: 'Courier to Nakuru', received: '2026-09-16', status: 'Replied' },
{ id: 'MSG-205', name: 'Cynthia K.', subject: 'Futura heat limits', received: '2026-09-15', status: 'Replied' }];


export const discounts = [
{ code: 'LUXE10', type: 'Percentage', value: '10%', usage: '34 / 200', status: 'Active', expires: '2026-10-31' },
{ code: 'NEWLOOK', type: 'Fixed amount', value: 'KSh 1,500', usage: '12 / 50', status: 'Active', expires: '2026-09-30' },
{ code: 'STORECOLLECT', type: 'Free delivery', value: 'Collection', usage: '61 / —', status: 'Active', expires: 'No expiry' },
{ code: 'AUGUST25', type: 'Percentage', value: '15%', usage: '88 / 100', status: 'Expired', expires: '2026-08-31' }];