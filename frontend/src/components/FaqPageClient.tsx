'use client';

import React, { useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { ChevronDownIcon } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    question: 'What types of wigs do you sell?',
    answer: (
      <span>
        Dallian Luxe Hair specialises in two distinct ranges: 100% Virgin Human Hair wigs and premium Japanese Futura wigs. Browse our complete range in the{' '}
        <Link to="/shop" className="text-chestnut underline hover:text-[#C89D34]">
          Shop collection
        </Link>{' '}
        or explore by{' '}
        <Link to="/categories" className="text-chestnut underline hover:text-[#C89D34]">
          Categories
        </Link>
        .
      </span>
    ),
  },
  {
    question: 'What is Japanese Futura wigs?',
    answer:
      'Futura is a high-grade synthetic fibre used in luxury wig making. It holds styled textures (straight, curls, body waves) flawlessly and is heat-friendly up to 180°C.',
  },
  {
    question: 'What is 100% Virgin Human Hair?',
    answer:
      'Our virgin human hair wigs are constructed with real donor hair where cuticles remain intact and unidirectional. They can be washed, bleached, colored, blow-dried, and heat-styled just like your natural hair.',
  },
  {
    question: 'How do I choose the right wig?',
    answer: (
      <span>
        Explore our curated styles in the{' '}
        <Link to="/shop" className="text-chestnut underline hover:text-[#C89D34]">
          Shop
        </Link>{' '}
        or message our concierge directly via the{' '}
        <Link to="/contact" className="text-chestnut underline hover:text-[#C89D34]">
          Contact page
        </Link>{' '}
        for personalized styling and face-shape consultations.
      </span>
    ),
  },
  {
    question: 'How do I care for my wig?',
    answer: (
      <span>
        Wash gently in lukewarm water using sulfate-free shampoo, detangle from ends to roots, and air dry on a wig stand. For in-depth salon maintenance or deep revamping, discover our{' '}
        <Link to="/services" className="text-chestnut underline hover:text-[#C89D34]">
          Studio Services
        </Link>
        .
      </span>
    ),
  },
  {
    question: 'How long does delivery take?',
    answer: (
      <span>
        Within Nairobi, we offer express same-day courier dispatch (2-5 hours). For orders outside Nairobi across Kenya, delivery takes 24 to 48 hours via G4S and Fargo Courier. Full rates and zones are on our{' '}
        <Link to="/delivery" className="text-chestnut underline hover:text-[#C89D34]">
          Delivery & Shipping page
        </Link>
        .
      </span>
    ),
  },
  {
    question: 'Where is your studio located?',
    answer: (
      <span>
        Our physical studio is located at Mountain Mall, Thika Road, Nairobi, Kenya. Full operating hours, parking instructions, and map directions can be found on our{' '}
        <Link to="/contact" className="text-chestnut underline hover:text-[#C89D34]">
          Contact page
        </Link>
        .
      </span>
    ),
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept Safaricom M-Pesa (STK Push & Buy Goods), major debit/credit cards (Visa & Mastercard), and direct bank transfers. All transactions are SSL encrypted and secure.',
  },
  {
    question: 'Can I exchange or return a wig?',
    answer: (
      <span>
        Yes, we provide a 7-day exchange window for unworn, unaltered units with uncut lace in their original satin packaging. Detailed instructions are available in our{' '}
        <Link to="/returns" className="text-chestnut underline hover:text-[#C89D34]">
          Returns & Exchanges Policy
        </Link>
        .
      </span>
    ),
  },
  {
    question: 'How can I track my order?',
    answer: (
      <span>
        Once dispatched, you will receive an SMS and tracking link. You can also visit our{' '}
        <Link to="/track" className="text-chestnut underline hover:text-[#C89D34]">
          Order Tracking portal
        </Link>{' '}
        and enter your order ID and phone number.
      </span>
    ),
  },
];

export function FaqPageClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <div className="mx-auto max-w-page px-5 pt-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-ink/50">
          <Link to="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="font-medium text-ink/80">Frequently Asked Questions</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-page gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16 lg:py-12">
        <div>
          <div className="mb-6">
            <span className="label-luxe text-[#C89D34]">Help Center</span>
            <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">
              Frequently Asked Questions
            </h1>
          </div>

          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((faq, index) => (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-serif text-base text-ink sm:text-lg">{faq.question}</span>
                  <ChevronDownIcon
                    width={18}
                    height={18}
                    className={`shrink-0 text-chestnut transition-transform duration-200 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="pb-5 text-sm leading-relaxed text-ink/70">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink/45">
            These answers are maintained by Dallian Luxe Hair and updated regularly to reflect our current studio offerings.
          </p>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="border border-ink/10 bg-white p-7 shadow-xs">
            <h2 className="font-serif text-xl text-ink">Still have a question?</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/60">
              Our concierge team is available to advise on length, lace customization, texture, and delivery to your area.
            </p>
            <LinkButton to="/contact" className="mt-6 w-full">
              Contact Us
            </LinkButton>
            <ul className="mt-7 space-y-3 border-t border-ink/10 pt-6 text-sm">
              {[
                { label: 'Delivery & Shipping', to: '/delivery' },
                { label: 'Returns & Exchanges', to: '/returns' },
                { label: 'Studio Services & Salon', to: '/services' },
                { label: 'Track Your Live Order', to: '/track' },
                { label: 'Terms & Conditions', to: '/terms' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-ink/70 underline-offset-4 hover:text-chestnut hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
