import type { Review } from '../types';

export const reviews: Review[] = [
{
  id: 'rv-1',
  productId: 'dlh-001',
  author: 'Wanjiru M.',
  location: 'Nairobi',
  rating: 5,
  title: 'Exactly what I wanted',
  body: 'The wave pattern is beautiful and it felt comfortable from the first day. The team at Mountain Mall helped me pick the length.',
  date: '2026-09-02',
  verified: true,
  status: 'published'
},
{
  id: 'rv-2',
  productId: 'dlh-003',
  author: 'Achieng O.',
  location: 'Kisumu',
  rating: 5,
  title: 'Ready to wear',
  body: 'I wore the bob straight out of the box for a wedding. Light, neat and the shape held all evening.',
  date: '2026-08-21',
  verified: true,
  status: 'published'
},
{
  id: 'rv-3',
  productId: 'dlh-002',
  author: 'Faith K.',
  location: 'Thika',
  rating: 4,
  title: 'Beautiful shine',
  body: 'Sleek and glossy. Delivery to Thika was handled well and the packaging felt premium.',
  date: '2026-08-14',
  verified: true,
  status: 'published'
},
{
  id: 'rv-4',
  productId: 'dlh-006',
  author: 'Amina H.',
  location: 'Mombasa',
  rating: 5,
  title: 'Curls bounce back',
  body: 'After washing, the curls returned just as the care card described. Very happy with this one.',
  date: '2026-07-30',
  verified: true,
  status: 'published'
},
{
  id: 'rv-5',
  productId: 'dlh-005',
  author: 'Njeri W.',
  location: 'Nairobi',
  rating: 5,
  title: 'Seamless hairline',
  body: 'The lace melts well and nobody could tell. Worth the investment.',
  date: '2026-09-11',
  verified: false,
  status: 'pending'
}];


export const trustPoints = [
{
  title: 'Secure Checkout',
  body: 'Payment options are configured by Dallian Luxe Hair and confirmed before your order is processed.',
  icon: 'shield'
},
{
  title: 'Quality Wig Collection',
  body: 'Every piece in the collection is selected by our team across human hair and Japanese Futura fibre.',
  icon: 'sparkles'
},
{
  title: 'Customer Support',
  body: 'Talk to us on WhatsApp or by phone during store hours for sizing, colour and install questions.',
  icon: 'headset'
},
{
  title: 'Physical Store Location',
  body: 'Visit us at Mountain Mall, Thika Road, Nairobi to see and try pieces in person.',
  icon: 'store'
}];


export const faqs: {question: string;answer: string;}[] = [
{
  question: 'What types of wigs do you sell?',
  answer:
  'Dallian Luxe Hair specialises in two ranges: Premium Human Hair wigs and Japanese Futura Fibre wigs. Each product page lists the range, available lengths, colours and cap options as configured by the store.'
},
{
  question: 'What is Japanese Futura fibre?',
  answer:
  'Futura is a high-grade synthetic fibre used in premium wig making. It holds style well and is heat-friendly within the limits published by the store on each product page.'
},
{
  question: 'What is human hair?',
  answer:
  'Human hair wigs are made from real hair, which is why they can be styled, washed and treated much like your own. Sourcing details for each batch are maintained by the store administrator.'
},
{
  question: 'How do I choose the right wig?',
  answer:
  'Start with the Find Your Perfect Wig tool for a shortlist based on style, length, texture, colour and budget, or contact us and our team will guide you.'
},
{
  question: 'How do I choose the right length?',
  answer:
  'Lengths are listed in inches on each product. As a guide, shorter lengths sit around the chin and longer lengths fall past the shoulders. Our team can advise on your height and preferred silhouette.'
},
{
  question: 'How do I care for my wig?',
  answer:
  'Follow the Wig Care Guide on this site, which covers washing, storage, detangling, shedding and curl maintenance for both ranges.'
},
{
  question: 'How long does delivery take?',
  answer:
  'Delivery timelines and fees are configured by Dallian Luxe Hair and shown at checkout for your selected delivery option before you pay.'
},
{
  question: 'Where are you located?',
  answer: 'Our store is at Mountain Mall, Thika Road, Nairobi, Kenya. Store hours are listed on the Contact page.'
},
{
  question: 'What payment methods are available?',
  answer:
  'M-Pesa, card payment and any additional methods enabled by the store administrator appear as options at checkout. Payment details are shown to you during the payment step.'
},
{
  question: 'Can I return a wig?',
  answer:
  'Returns are handled according to the Returns Policy published by Dallian Luxe Hair. Please review that page or contact us before sending anything back.'
},
{
  question: 'How can I track my order?',
  answer:
  'Use the Order Tracking page with your order number and the phone number or email used at checkout to see the current stage of your order.'
}];


export const careGuide: {title: string;steps: string[];}[] = [
{
  title: 'How to Wash Your Wig',
  steps: [
  'Detangle gently from the ends upward before any water touches the hair.',
  'Use cool water and a mild, sulphate-free shampoo, stroking downward rather than rubbing.',
  'Rinse thoroughly, apply conditioner to the mid-lengths and ends, then rinse again.',
  'Blot with a towel and let the wig air-dry on a stand — never wring or twist.']

},
{
  title: 'How to Store Your Wig',
  steps: [
  'Keep the wig on a stand or mannequin head so the cap holds its shape.',
  'Store away from direct sunlight, heat and damp.',
  'Use the satin bag for travel and cover longer styles loosely to avoid friction.']

},
{
  title: 'How to Maintain Human Hair Wigs',
  steps: [
  'Wash only as often as needed — over-washing shortens the life of the hair.',
  'Apply a light leave-in or hair oil to the ends, keeping product off the lace.',
  'Use low heat when styling and always apply a heat protectant first.']

},
{
  title: 'How to Maintain Fibre Wigs',
  steps: [
  'Stay within the heat limits published for your piece; excessive heat cannot be reversed.',
  'Use products formulated for synthetic fibre rather than oils intended for human hair.',
  'Let the fibre dry fully on a stand so the original style sets again.']

},
{
  title: 'How to Detangle',
  steps: [
  'Work in small sections with a wide-tooth comb or your fingers.',
  'Start at the ends and move upward, holding the section above the knot to protect the cap.',
  'A light mist of water or detangling spray makes the process gentler.']

},
{
  title: 'How to Reduce Shedding',
  steps: [
  'Avoid pulling at the roots when combing or removing the wig.',
  'Keep the cap and knots dry of heavy oils.',
  'Sleep in a satin scarf or store the wig on a stand overnight rather than wearing it to bed.']

},
{
  title: 'How to Maintain Curls',
  steps: [
  'Refresh curls with water and a light curl cream, then scrunch rather than comb.',
  'Use a diffuser on low heat or let curls air-dry.',
  'Separate curls with fingertips once dry to keep definition without frizz.']

}];


export const policyPages: Record<
  'delivery' | 'returns' | 'privacy' | 'terms',
  {title: string;intro: string;sections: {heading: string;body: string;}[];}> =
{
  delivery: {
    title: 'Delivery Information',
    intro:
    'Delivery options, zones, fees and timelines for Dallian Luxe Hair are configured by the store administrator and shown to you at checkout before payment.',
    sections: [
    {
      heading: 'Delivery Options',
      body: 'Available options — including in-store collection at Mountain Mall, Nairobi delivery and countrywide courier — appear at the Delivery step of checkout with the fee that applies to your address.'
    },
    {
      heading: 'Timelines',
      body: 'Each delivery option displays its own timeline as published by the store. You will receive the confirmed timeline with your order confirmation.'
    },
    {
      heading: 'Order Updates',
      body: 'Once your order is placed you can follow it on the Order Tracking page using your order number and the phone number or email used at checkout.'
    },
    {
      heading: 'Delivery Questions',
      body: 'For anything specific to your location, contact us on 0792 11 42 92 or dallianltd@gmail.com and our team will confirm the details.'
    }]

  },
  returns: {
    title: 'Returns Policy',
    intro:
    'Return eligibility, timeframes and conditions are set by Dallian Luxe Hair and maintained from the admin dashboard. The summary below explains the process.',
    sections: [
    {
      heading: 'Before You Return',
      body: 'Contact us with your order number so our team can confirm whether your item is eligible under the current published policy.'
    },
    {
      heading: 'Condition of Items',
      body: 'Hygiene requirements apply to wigs. Any conditions relating to packaging, tags and whether an item has been worn or installed are defined by the store.'
    },
    {
      heading: 'Processing a Return',
      body: 'Approved returns are recorded against your order and progress to a Returned status, which you can see on the Order Tracking page.'
    },
    {
      heading: 'Refunds and Exchanges',
      body: 'Where a refund or exchange applies, the method and timing follow the payment option used on the original order.'
    }]

  },
  privacy: {
    title: 'Privacy Policy',
    intro:
    'This page describes, in general terms, how Dallian Luxe Hair handles the information you provide when shopping. Specific retention and handling details are maintained by the business.',
    sections: [
    {
      heading: 'Information We Collect',
      body: 'We collect the details you enter to place and deliver an order: your name, phone number, email address and delivery address.'
    },
    {
      heading: 'How It Is Used',
      body: 'Your information is used to process your order, arrange delivery, confirm payment and respond to your enquiries.'
    },
    {
      heading: 'Communication',
      body: 'Order confirmations and updates are sent to the contact details you provide. Newsletter subscription is optional and you may unsubscribe at any time.'
    },
    {
      heading: 'Your Choices',
      body: 'You can review and update your saved details in your account, or contact us at dallianltd@gmail.com with any request regarding your information.'
    }]

  },
  terms: {
    title: 'Terms & Conditions',
    intro:
    'These terms cover the use of the Dallian Luxe Hair website and the purchase of products through it. Commercial specifics are configured by the business.',
    sections: [
    {
      heading: 'Products and Descriptions',
      body: 'Product names, specifications, colours, lengths and prices shown on this site are maintained by the store administrator and may be updated.'
    },
    {
      heading: 'Orders',
      body: 'Placing an order creates a request to purchase. An order is confirmed once payment is verified by our team and the status updates accordingly.'
    },
    {
      heading: 'Pricing and Payment',
      body: 'Prices are shown in Kenyan Shillings. Accepted payment methods are those enabled by the store at the time of checkout.'
    },
    {
      heading: 'Contact',
      body: 'For any question about these terms, contact Dallian Luxe Hair at Mountain Mall, Thika Road, Nairobi, on 0792 11 42 92 or at dallianltd@gmail.com.'
    }]

  }
};