'use client';

import React, { useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { ChevronDownIcon } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

const faqs = [
  {
    question: 'What types of wigs do you sell?',
    answer:
      'Dallian Luxe Hair specialises in two ranges: Premium Human Hair wigs and Japanese Futura Fibre wigs. Each product page lists the range, available lengths, colours and cap options as configured by the store.',
  },
  {
    question: 'What is Japanese Futura fibre?',
    answer:
      'Futura is a high-grade synthetic fibre used in premium wig making. It holds style well and is heat-friendly within the limits published by the store on each product page.',
  },
  {
    question: 'What is human hair?',
    answer:
      'Human hair wigs are made from real hair, which is why they can be styled, washed and treated much like your own. Sourcing details for each batch are maintained by the store administrator.',
  },
  {
    question: 'How do I choose the right wig?',
    answer:
      'Start with the Find Your Perfect Wig tool for a shortlist based on style, length, texture, colour and budget, or contact us and our team will guide you.',
  },
  {
    question: 'How do I choose the right length?',
    answer:
      'Lengths are listed in inches on each product. As a guide, shorter lengths sit around the chin and longer lengths fall past the shoulders. Our team can advise on your height and preferred silhouette.',
  },
  {
    question: 'How do I care for my wig?',
    answer:
      'Follow the Wig Care Guide on this site, which covers washing, storage, detangling, shedding and curl maintenance for both ranges.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Delivery timelines and fees are configured by Dallian Luxe Hair and shown at checkout for your selected delivery option before you pay.',
  },
  {
    question: 'Where are you located?',
    answer: 'Our store is at Mountain Mall, Thika Road, Nairobi, Kenya. Store hours are listed on the Contact page.',
  },
  {
    question: 'What payment methods are available?',
    answer:
      'M-Pesa, card payment and any additional methods enabled by the store administrator appear as options at checkout. Payment details are shown to you during the payment step.',
  },
  {
    question: 'Can I return a wig?',
    answer:
      'Returns are handled according to the Returns Policy published by Dallian Luxe Hair. Please review that page or contact us before sending anything back.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'Use the Order Tracking page with your order number and the phone number or email used at checkout to see the current stage of your order.',
  },
];

export default function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <div className="mx-auto grid max-w-page gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16 lg:py-14">
        <div>
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
                  <p className="pb-5 text-sm leading-relaxed text-ink/70">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs leading-relaxed text-ink/45">
            These answers are maintained by Dallian Luxe Hair from the admin dashboard and may be updated.
          </p>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="border border-ink/10 bg-white p-7">
            <h2 className="font-serif text-xl text-ink">Still have a question?</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-ink/60">
              Our team can advise on length, texture, colour and delivery to your area.
            </p>
            <LinkButton to="/contact" className="mt-6 w-full">
              Contact Us
            </LinkButton>
            <ul className="mt-7 space-y-3 border-t border-ink/10 pt-6 text-sm">
              {[
                { label: 'Wig Care Guide', to: '/wig-care' },
                { label: 'Delivery Information', to: '/delivery' },
                { label: 'Returns Policy', to: '/returns' },
                { label: 'Track Your Order', to: '/track' },
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