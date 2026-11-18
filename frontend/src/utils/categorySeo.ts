import { brand } from '@/data/brand';
import type { Product } from '@/types';
import { absoluteUrl } from './seo';

const SITE_NAME = brand.name || 'Dallian Luxe Hair';
const SITE_URL = 'https://dallian.online';

export interface CategorySeoContext {
  intro: string;
  careGuide: string;
  highlights: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export function getCategorySeoContext(category: { name: string; slug: string }): CategorySeoContext {
  const slug = category.slug.toLowerCase();
  const name = category.name;

  if (slug.includes('vietnamese')) {
    return {
      intro:
        'Explore 100% authentic Vietnamese raw human hair wigs in Nairobi. Renowned for full, naturally thick cuticles from roots to ends, lustrous sheen, and exceptional durability, ideal for silk-press bone straight and body wave styling.',
      careGuide:
        'Wash gently using sulfate-free shampoo and lukewarm water. Deep-condition bi-weekly and apply lightweight argan oil before heat styling to preserve the dense, silky cuticle alignment for up to 3 to 5 years.',
      highlights: [
        '100% Raw Vietnamese Human Hair',
        'Double Drawn Natural Fullness from Root to Tip',
        'Bleach, Dye & Heat Tolerant (up to 230°C)',
        'Superior Longevity (3 to 5+ Years)',
      ],
      faqs: [
        {
          question: 'What makes Vietnamese human hair special?',
          answer:
            'Vietnamese hair is celebrated for its thick, resilient strands and full ends. It holds bone straight presses and heat curls better than thinner textures and can be bleached to honey or 613 blonde without losing its softness.',
        },
        {
          question: 'Are Dallian Vietnamese hair wigs 100% virgin human hair?',
          answer:
            'Yes. Every piece is sourced from authentic single donors with intact, cuticle-aligned strands and zero synthetic fillers.',
        },
        {
          question: 'Can I get same-day delivery for Vietnamese hair in Nairobi?',
          answer:
            'Yes. Orders placed before 3:00 PM qualify for same-day doorstep rider delivery within Nairobi and Kiambu for KES 200 flat rate. Nationwide courier dispatch across Kenya takes 24–48 hours for KES 400, and free in-person collection is available at our Mountain Mall studio.',
        },
        {
          question: 'Can I inspect and try on the wig in person?',
          answer:
            'Yes, visit our Mountain Mall studio along Thika Road, Nairobi, for personal hair consultation, density checks, and lace matching.',
        },
      ],
    };
  }

  if (slug.includes('human') || slug.includes('virgin') || slug.includes('raw')) {
    return {
      intro:
        'Explore 100% cuticle-aligned raw and virgin human hair wigs in Nairobi. Each piece is crafted for maximum styling versatility, allowing you to wash, bleach, color, and heat style just like your own natural hair.',
      careGuide:
        'Wash gently using sulfate-free shampoo and lukewarm water. Deep-condition bi-weekly and apply lightweight argan oil before heat styling to keep the cuticles silky, soft, and completely tangle-free for years.',
      highlights: [
        '100% Raw & Virgin Human Hair',
        'Bleach & Heat Stylable (up to 230°C)',
        'Melted HD Transparent Lace',
        'Full 150% to 200% Natural Density',
      ],
      faqs: [
        {
          question: 'Are Dallian human hair wigs 100% authentic virgin hair?',
          answer:
            'Yes. All Dallian virgin human hair units are made from 100% single-donor cuticle-aligned human hair with zero synthetic fillers or chemical silicone coatings. They can be bleached, dyed, and flat-ironed repeatedly.',
        },
        {
          question: 'How long does a virgin human hair wig last with proper care?',
          answer:
            'With regular cleansing, conditioning, and gentle detangling, our virgin human hair wigs reliably last between 2 to 4+ years of consistent wear.',
        },
        {
          question: 'Can I get same-day delivery for human hair wigs in Nairobi?',
          answer:
            'Yes. Orders placed before 3:00 PM qualify for same-day doorstep rider delivery within Nairobi and Kiambu for KES 200 flat rate. Nationwide courier delivery across Kenya takes 24–48 hours for KES 400, and studio pickup at Mountain Mall is free.',
        },
        {
          question: 'Can I visit and try on wigs before purchasing in Nairobi?',
          answer:
            'Yes, you are warmly invited to our boutique studio at Mountain Mall along Thika Road, Nairobi, for in-person consultations, lace-tint matching, and fitting.',
        },
      ],
    };
  }

  if (slug.includes('futura') || slug.includes('synthetic')) {
    return {
      intro:
        'Discover high-temperature Japanese Futura synthetic fibre wigs. Engineered with advanced heat resistance up to 180°C and superior curl memory, offering effortless, ready-to-wear luxury straight out of the box.',
      careGuide:
        'Wash in cool water using mild wig shampoo. Gently towel blot and let air dry on a wig stand. Futura fibres snap back to their factory bounce and smooth texture without requiring tedious daily styling.',
      highlights: [
        'Japanese Futura Heat-Resistant Fibre (up to 180°C)',
        'Superior Wash & Wear Memory',
        'Pre-plucked Hairline & Natural Parting',
        'Budget-Friendly Everyday Glamour',
      ],
      faqs: [
        {
          question: 'Can I use curling tongs or flat irons on Japanese Futura wigs?',
          answer:
            'Yes. Japanese Futura is specially formulated to tolerate heat tools up to 180°C (350°F). For best results, use low-to-medium heat settings and allow curls to cool in hand to set the shape.',
        },
        {
          question: 'How do I prevent tangles in synthetic Futura wigs?',
          answer:
            'Comb gently from tips to roots using a wide-tooth comb or loop brush. A light silicone wig spray or detangling mist will keep the strands supple and static-free.',
        },
        {
          question: 'How soon can I receive my Futura wig in Nairobi and Kenya?',
          answer:
            'We provide same-day rider dispatch across Nairobi for KES 200 flat rate. Nationwide delivery to Mombasa, Kisumu, Nakuru, and other towns arrives within 24 to 48 hours for KES 400 via trusted courier. Free studio pickup is also available at Mountain Mall along Thika Road.',
        },
      ],
    };
  }

  // Default context
  return {
    intro: `Browse our luxury collection of ${name.toLowerCase()} wigs in Nairobi. Designed for seamless hairline blending, supreme comfort, and long-lasting beauty.`,
    careGuide:
      'Store your wig on a mannequin head or satin pouch when not in use. Detangle gently starting from the ends and cleanse periodically with hydrating wig shampoo.',
    highlights: [
      'Premium Salon-Grade Craftsmanship',
      'Breathable Comfort-Fit Cap Construction',
      'Pre-Plucked Natural Hairline',
      'Nationwide Fast Delivery in Kenya',
    ],
    faqs: [
      {
        question: `Where can I buy ${name.toLowerCase()} wigs in Nairobi?`,
        answer: `You can order online directly from Dallian Luxe Hair (dallian.online) or visit our store at Mountain Mall, Thika Road, Nairobi for personalized fitting.`,
      },
      {
        question: `Do you deliver ${name.toLowerCase()} wigs outside Nairobi?`,
        answer:
          'Yes, we ship nationwide across all 47 counties in Kenya for KES 400 flat rate via G4S and Fargo Courier (24–48 hours). Nairobi same-day doorstep rider delivery is KES 200, and studio pickup at Mountain Mall is free.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept M-Pesa (Buy Goods / Till & Send Money), Card payments, and Bank Transfer for your peace of mind and swift checkout.',
      },
    ],
  };
}

export function getStyleSeoContext(style: { name: string; slug: string }): CategorySeoContext {
  const name = style.name;
  const slug = style.slug.toLowerCase();

  if (slug.includes('frontal') || slug.includes('13x4') || slug.includes('lace')) {
    return {
      intro:
        'Explore 13x4 full frontal transparent lace wigs at Dallian Luxe Hair Nairobi. Featuring generous ear-to-ear parting space, transparent HD lace that melts invisibly into all complexions, and ultra-soft strands with the authentic touch and bounce of natural hair.',
      careGuide:
        'Apply lace tint or powder foundation matching your scalp tone to the underside of the lace before installation. Cleanse gently with cool water, avoid rubbing the delicate lace grid, and secure with a satin melting band for a flawless finish.',
      highlights: [
        '13x4 Ear-to-Ear Full Frontal Lace',
        'Transparent HD Lace Scalp Melt',
        'Soft-Like-Human-Hair Strands',
        'Free-Parting & Multi-Style Versatility',
      ],
      faqs: [
        {
          question: 'What are the benefits of a 13x4 full frontal transparent lace wig?',
          answer:
            'A 13x4 frontal gives you a full 13 inches of ear-to-ear hairline coverage and 4 inches of parting depth, letting you part your hair anywhere in the middle, side, or half-up styles with an undetectable hairline melt.',
        },
        {
          question: 'Does transparent lace match African and melanin-rich skin tones?',
          answer:
            'Yes. Transparent lace is ultra-thin and adapts seamlessly when paired with lace tint spray or matching setting powder.',
        },
        {
          question: 'Can I get my frontal wig installed or customized at Mountain Mall?',
          answer:
            'Yes. Our in-house stylists at Mountain Mall along Thika Road offer professional lace customization, bleaching of knots, and installation.',
        },
      ],
    };
  }

  return {
    intro: `Find the perfect ${name} texture wigs at Dallian Luxe Hair Nairobi. Hand-picked strands engineered for fluid movement, enviable volume, and realistic natural shine.`,
    careGuide: `To maintain defined ${name} texture, moisturize regularly with lightweight leave-in conditioner and detangle with a wide-tooth comb while damp.`,
    highlights: [
      `${name} Precision Texture`,
      'Natural Movement & Volume',
      'Minimal Shedding & Tangle-Free',
      'Ready to Wear or Custom Install',
    ],
    faqs: [
      {
        question: `How do I maintain my ${name} wig texture?`,
        answer: `Use light silicone serums or leave-in sprays for shine and detangle gently from tips upwards. Braid or twist curly textures before bed and sleep in a satin bonnet.`,
      },
      {
        question: `Can I get same-day delivery for ${name} wigs in Nairobi?`,
        answer: `Yes, in-stock units qualify for same-day door-to-door rider delivery across Nairobi for KES 200 flat rate, nationwide courier across Kenya for KES 400, or free pickup at our Mountain Mall studio along Thika Road.`,
      },
    ],
  };
}

export function getCategoryKeywords(category: { name: string; slug: string }): string[] {
  const slug = category.slug.toLowerCase();
  const name = category.name.toLowerCase();

  if (slug.includes('vietnamese')) {
    return [
      'vietnamese human hair wigs nairobi',
      'vietnamese bone straight wigs kenya',
      'raw vietnamese hair nairobi',
      'vietnamese double drawn wigs kenya',
      'human hair wigs prices in kenya',
      'virgin human hair wigs nairobi',
      '100% human hair wigs kenya',
      'mountain mall thika road wigs',
      'same day wig delivery nairobi',
      'dallian luxe hair',
    ];
  }

  if (slug.includes('human') || slug.includes('virgin') || slug.includes('raw')) {
    return [
      'human hair wigs in nairobi',
      'human hair wigs prices in kenya',
      'virgin human hair wigs nairobi',
      '100% human hair wigs kenya',
      'raw virgin hair mountain mall thika road',
      'glueless human hair wigs nairobi',
      'hd lace frontal wigs kenya',
      'human hair bundles with closure nairobi',
      'best human hair wigs shop in nairobi',
      'bleach dye human hair wigs kenya',
      'double drawn human hair wigs nairobi',
      'affordable virgin hair kenya',
      'same day wig delivery nairobi',
      'dallian luxe hair nairobi',
    ];
  }

  if (slug.includes('futura') || slug.includes('synthetic')) {
    return [
      'japanese futura unit nairobi',
      'japanese futura wigs kenya',
      'heat resistant wigs nairobi',
      'futura synthetic wigs price in kenya',
      'affordable synthetic wigs nairobi',
      'ready to wear wigs kenya',
      'glueless synthetic wigs nairobi',
      'japanese futura hair mountain mall',
      'pre plucked synthetic lace wigs nairobi',
      'synthetic wigs same day delivery kenya',
      'dallian luxe futura wigs',
    ];
  }

  return [
    `${name} wigs nairobi`,
    `buy ${name} wigs online kenya`,
    `${name} wigs price in kenya`,
    `luxury ${name} wigs nairobi`,
    'wig shop mountain mall thika road',
    'same day wig delivery nairobi',
    'dallian luxe hair',
  ];
}

export function getStyleKeywords(style: { name: string; slug: string }): string[] {
  const name = style.name.toLowerCase();

  return [
    `${name} wigs nairobi`,
    `${name} hair price in kenya`,
    `buy ${name} wigs kenya`,
    `${name} virgin human hair nairobi`,
    `${name} closure wig kenya`,
    `glueless ${name} wigs nairobi`,
    'wig shop mountain mall thika road',
    'same day wig delivery nairobi',
    'dallian luxe hair',
  ];
}

export function buildCategoryJsonLd(
  category: { name: string; slug: string; seo_name?: string; seo_description?: string },
  products: Product[],
  canonicalUrl: string,
  customKeywords?: string[]
) {
  const keywords = customKeywords || getCategoryKeywords(category);
  const validPrices = products
    .map((p) => (typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0))))
    .filter((p) => !isNaN(p) && p > 0);

  const lowPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
  const highPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;

  return {
    '@context': 'https://schema.org/',
    '@type': 'CollectionPage',
    name: category.seo_name || `${category.name} Wigs Nairobi | ${SITE_NAME}`,
    description:
      category.seo_description ||
      `Shop luxury ${category.name.toLowerCase()} wigs in Nairobi. 100% authentic quality, secure payment via M-Pesa, and fast delivery across Kenya.`,
    url: canonicalUrl,
    keywords: keywords.join(', '),
    inLanguage: 'en-KE',
    mainEntityOfPage: canonicalUrl,
    provider: {
      '@type': 'HairSalon',
      name: SITE_NAME,
      url: SITE_URL,
      telephone: brand.phoneIntl,
      address: {
        '@type': 'PostalAddress',
        streetAddress: brand.addressLine1 || 'Mountain Mall, Thika Road',
        addressLocality: 'Nairobi',
        addressCountry: 'KE',
      },
    },
    ...(lowPrice && highPrice
      ? {
          offers: {
            '@type': 'AggregateOffer',
            lowPrice,
            highPrice,
            offerCount: products.length,
            priceCurrency: 'KES',
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              applicableCountry: 'KE',
              merchantReturnDays: 7,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
            },
          },
        }
      : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 24).map((product, index) => {
        const imageUrl = product.images?.[0] ? absoluteUrl(product.images[0]) : undefined;
        const productUrl = `${SITE_URL}/product/${encodeURIComponent(product.slug)}`;
        const itemDescription =
          product.description?.trim() ||
          `Buy ${product.name} wig at Dallian Luxe Hair Nairobi. Same-day delivery across Nairobi and nationwide courier in Kenya.`;

        const productItem: Record<string, unknown> = {
          '@type': 'Product',
          name: product.name,
          description: itemDescription,
          url: productUrl,
          ...(imageUrl ? { image: imageUrl } : {}),
          sku: `DL-${product.id}`,
          itemCondition: 'https://schema.org/NewCondition',
          category: category.name,
          brand: {
            '@type': 'Brand',
            name: SITE_NAME,
          },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'KES',
            availability: 'https://schema.org/InStock',
            url: productUrl,
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              applicableCountry: 'KE',
              merchantReturnDays: 7,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
            },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'KE',
              },
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '200',
                currency: 'KES',
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 1,
                  unitCode: 'DAY',
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 2,
                  unitCode: 'DAY',
                },
              },
            },
          },
        };

        if (product.rating && product.rating > 0 && product.reviewCount) {
          productItem.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating.toFixed(1)),
            reviewCount: String(product.reviewCount),
            bestRating: '5',
            worstRating: '1',
          };
        }

        return {
          '@type': 'ListItem',
          position: index + 1,
          item: productItem,
        };
      }),
    },
  };
}

export function buildBreadcrumbJsonLd(categoryName: string, canonicalUrl: string) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Collections & Categories',
        item: `${SITE_URL}/categories`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: canonicalUrl,
      },
    ],
  };
}

export function buildFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
