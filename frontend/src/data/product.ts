import type { Product } from '../types';

const IMG = {
  bodyWave: "/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg",
  silkyStraight: "/2214af5c-9a6c-4846-b6aa-c860dc07471f.jpg",

  bob: "/f1194d78-3143-40b7-8077-cc62ea396e67.jpg",
  deepWave: "/c1286a5a-6feb-4873-afd4-180b44938f5d.jpg",
  hdLace: "/40609846-8a62-42e1-acfb-284505ec078e.jpg",
  curly: "/f9c35955-16ca-4e72-b5b6-36d9dac86f93.jpg",
  classicStraight: "/5d42e680-c400-402a-ba6b-3f44329c43ec.jpg"

};

const colorSet = {
  naturals: [
  { name: 'Natural Black', hex: '#0B0B0B' },
  { name: 'Deep Chestnut', hex: '#5A2E22' },
  { name: 'Rich Chestnut', hex: '#7A3F2B' }],

  warm: [
  { name: 'Rich Chestnut', hex: '#7A3F2B' },
  { name: 'Honey Gold', hex: '#D4A72C' },
  { name: 'Natural Black', hex: '#0B0B0B' }]

};

const careNote =
'Care and styling guidance for this piece is published by Dallian Luxe Hair in the Wig Care Guide.';

export const products: Product[] = [
{
  id: 'dlh-001',
  slug: 'luxury-body-wave',
  name: 'Luxury Body Wave',
  category: 'human-hair',
  style: 'Body Wave',
  lengths: [16, 18, 20, 24, 28],
  colors: colorSet.warm,
  laceTypes: ['HD Lace', 'Transparent Lace'],
  capTypes: ['Lace Front', 'Full Lace'],
  price: 24500,
  compareAtPrice: 27000,
  rating: 4.8,
  reviewCount: 34,
  availability: 'in-stock',
  stock: 18,
  images: [IMG.bodyWave, IMG.deepWave, IMG.hdLace],
  shortDescription:
  'A soft, flowing wave with natural movement — our most requested everyday luxury piece.',
  description:
  'The Luxury Body Wave is a premium human hair wig with a relaxed, flowing wave pattern that holds its shape through the day. Details such as density, cap construction and lace finish are configured per batch by the Dallian Luxe Hair team and confirmed at purchase.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Premium Human Hair' },
  { label: 'Texture', value: 'Body Wave' },
  { label: 'Lace', value: 'HD / Transparent (selectable)' },
  { label: 'Cap', value: 'Lace Front or Full Lace' },
  { label: 'Density', value: 'Set by store' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: ['featured', 'bestseller'],
  createdAt: '2026-08-02',
  popularity: 98
},
{
  id: 'dlh-002',
  slug: 'silky-straight',
  name: 'Silky Straight',
  category: 'human-hair',
  style: 'Straight',
  lengths: [18, 20, 24, 28, 30],
  colors: colorSet.naturals,
  laceTypes: ['HD Lace'],
  capTypes: ['Lace Front', 'Glueless'],
  price: 26800,
  rating: 4.9,
  reviewCount: 41,
  availability: 'in-stock',
  stock: 12,
  images: [IMG.silkyStraight, IMG.classicStraight, IMG.hdLace],
  shortDescription: 'Glass-smooth, mirror-shine straight hair with a weightless fall.',
  description:
  'Silky Straight is cut and finished for a sleek, polished silhouette. Length, colour and cap options can be selected below; all other specifications are maintained by the store administrator.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Premium Human Hair' },
  { label: 'Texture', value: 'Straight' },
  { label: 'Lace', value: 'HD Lace' },
  { label: 'Cap', value: 'Lace Front or Glueless' },
  { label: 'Density', value: 'Set by store' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: ['featured'],
  createdAt: '2026-08-20',
  popularity: 94
},
{
  id: 'dlh-003',
  slug: 'glueless-bob',
  name: 'Glueless Bob',
  category: 'futura',
  style: 'Bob',
  lengths: [10, 12, 14],
  colors: colorSet.naturals,
  laceTypes: ['Transparent Lace'],
  capTypes: ['Glueless'],
  price: 12400,
  rating: 4.7,
  reviewCount: 27,
  availability: 'low-stock',
  stock: 3,
  images: [IMG.bob, IMG.classicStraight, IMG.silkyStraight],
  shortDescription: 'A blunt, sculpted bob you can wear straight out of the box.',
  description:
  'Made from Japanese Futura fibre, the Glueless Bob keeps its blunt shape with minimal styling and is heat-friendly within the limits published in our Wig Care Guide.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Japanese Futura Fibre' },
  { label: 'Texture', value: 'Blunt Bob' },
  { label: 'Lace', value: 'Transparent Lace' },
  { label: 'Cap', value: 'Glueless, adjustable' },
  { label: 'Heat Styling', value: 'Within limits set by store' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: ['bestseller'],
  createdAt: '2026-07-11',
  popularity: 90
},
{
  id: 'dlh-004',
  slug: 'deep-wave',
  name: 'Deep Wave',
  category: 'human-hair',
  style: 'Deep Wave',
  lengths: [18, 20, 24, 26],
  colors: colorSet.warm,
  laceTypes: ['HD Lace', 'Transparent Lace'],
  capTypes: ['Lace Front'],
  price: 27900,
  rating: 4.8,
  reviewCount: 22,
  availability: 'in-stock',
  stock: 9,
  images: [IMG.deepWave, IMG.bodyWave, IMG.curly],
  shortDescription: 'Deep, defined S-waves with generous volume and body.',
  description:
  'Deep Wave delivers sculpted definition from root to tip. Wave pattern retention depends on the care routine described in our Wig Care Guide.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Premium Human Hair' },
  { label: 'Texture', value: 'Deep Wave' },
  { label: 'Lace', value: 'HD / Transparent (selectable)' },
  { label: 'Cap', value: 'Lace Front' },
  { label: 'Density', value: 'Set by store' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: ['new'],
  createdAt: '2026-09-04',
  popularity: 81
},
{
  id: 'dlh-005',
  slug: 'hd-lace-frontal',
  name: 'HD Lace Frontal',
  category: 'human-hair',
  style: 'Straight',
  lengths: [20, 24, 28, 30],
  colors: colorSet.naturals,
  laceTypes: ['HD Lace'],
  capTypes: ['Lace Front', 'Full Lace'],
  price: 31500,
  rating: 4.9,
  reviewCount: 18,
  availability: 'in-stock',
  stock: 7,
  images: [IMG.hdLace, IMG.silkyStraight, IMG.bodyWave],
  shortDescription: 'An undetectable hairline finish for a truly seamless install.',
  description:
  'Our HD Lace Frontal is finished for a soft, natural-looking hairline with a flexible parting space. Install support is available in store.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Premium Human Hair' },
  { label: 'Texture', value: 'Straight' },
  { label: 'Lace', value: 'HD Lace' },
  { label: 'Cap', value: 'Lace Front or Full Lace' },
  { label: 'Parting', value: 'Free part' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: ['featured', 'new'],
  createdAt: '2026-09-10',
  popularity: 87
},
{
  id: 'dlh-006',
  slug: 'elegant-curly',
  name: 'Elegant Curly',
  category: 'futura',
  style: 'Curly',
  lengths: [14, 16, 18, 20],
  colors: colorSet.warm,
  laceTypes: ['Transparent Lace'],
  capTypes: ['Glueless', 'Lace Front'],
  price: 14900,
  compareAtPrice: 16500,
  rating: 4.6,
  reviewCount: 31,
  availability: 'in-stock',
  stock: 21,
  images: [IMG.curly, IMG.deepWave, IMG.bodyWave],
  shortDescription: 'Bouncy, defined curls in a light, wearable fibre.',
  description:
  'Elegant Curly is a Japanese Futura fibre piece with springy curl definition that bounces back after washing, following the routine in our Wig Care Guide.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Japanese Futura Fibre' },
  { label: 'Texture', value: 'Curly' },
  { label: 'Lace', value: 'Transparent Lace' },
  { label: 'Cap', value: 'Glueless or Lace Front' },
  { label: 'Heat Styling', value: 'Within limits set by store' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: ['bestseller'],
  createdAt: '2026-06-28',
  popularity: 85
},
{
  id: 'dlh-007',
  slug: 'classic-straight',
  name: 'Classic Straight',
  category: 'futura',
  style: 'Straight',
  lengths: [14, 16, 18, 22],
  colors: colorSet.naturals,
  laceTypes: ['Transparent Lace'],
  capTypes: ['Glueless'],
  price: 11800,
  rating: 4.5,
  reviewCount: 16,
  availability: 'out-of-stock',
  stock: 0,
  images: [IMG.classicStraight, IMG.silkyStraight, IMG.bob],
  shortDescription: 'An easy, refined everyday straight style with a soft side part.',
  description:
  'Classic Straight is an approachable Futura fibre wig for daily wear, with a soft side part and a lightweight glueless cap.',
  features: ['Premium Quality', 'Elegant Finish', 'Comfortable Fit', 'Carefully Selected'],
  specifications: [
  { label: 'Hair Type', value: 'Japanese Futura Fibre' },
  { label: 'Texture', value: 'Straight' },
  { label: 'Lace', value: 'Transparent Lace' },
  { label: 'Cap', value: 'Glueless, adjustable' },
  { label: 'Heat Styling', value: 'Within limits set by store' }],

  included: ['Wig in branded box', 'Wig net', 'Care card'],
  badges: [],
  createdAt: '2026-05-16',
  popularity: 62
}];


export const productCareNote = careNote;

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const categoryMeta: Record<
  'human-hair' | 'futura',
  {label: string;blurb: string;cta: string;image: string;}> =
{
  'human-hair': {
    label: 'Premium Human Hair',
    blurb: 'Natural beauty, luxurious texture and timeless elegance.',
    cta: 'SHOP HUMAN HAIR',
    image: "/7944b14b-3fd0-4899-8dbf-c03571669315.jpg"
  },
  futura: {
    label: 'Japanese Futura Fibre',
    blurb: 'Beautiful, versatile and stylish fibre wigs for effortless looks.',
    cta: 'SHOP FUTURA',
    image: "/6cac8a29-06d2-466c-b5ea-c7d4d8d00223.jpg"
  }
};