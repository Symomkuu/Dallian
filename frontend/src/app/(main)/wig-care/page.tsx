'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDownIcon } from 'lucide-react';
import { careGuide } from '@/data/content';
import { SectionHeading } from '@/components/SectionHeading';
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

export default function WigCarePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>

      <section className="border-b border-ink/10 bg-cream">
        <div className="mx-auto grid max-w-page items-center gap-6 px-4 py-8 sm:gap-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[3/2]">
            <Image
              src="/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg"
              alt="Wig care essentials — comb, spray bottle, satin bag and wig stand"
              fill
              className="object-cover"
            />
          </div>
          
          <SectionHeading
            eyebrow="Start Here"
            title="Three habits that matter most"
            body="Wash less often than you think, always dry on a stand, and detangle from the ends upward. Almost every problem customers bring back to us comes from skipping one of those three." 
          />
        </div>
      </section>

      <div className="mx-auto max-w-page px-4 py-8 sm:px-8 sm:py-12 lg:py-16">
        <ol className="grid gap-px border border-ink/10 bg-ink/10 lg:grid-cols-2">
          {careGuide.map((topic, index) => (
            <li key={topic.title} className="bg-cream p-5 sm:p-8">
              <p className="label-luxe text-gold">Step {String(index + 1).padStart(2, '0')}</p>
              <h2 className="mt-3 font-serif text-xl leading-snug text-ink sm:mt-4 sm:text-2xl">{topic.title}</h2>
              <ul className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                {topic.steps.map((step) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-ink/70">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-chestnut" aria-hidden="true" />
                    {step}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <section className="bg-chestnut-deep">
        <div className="mx-auto flex max-w-page flex-col items-start gap-5 px-4 py-10 sm:gap-6 sm:px-8 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-xl text-cream sm:text-3xl">Not sure which routine applies?</h2>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-cream/70 sm:mt-3">
              Human hair and Futura fibre are cared for differently. Tell us which piece you have and we will
              walk you through it.
            </p>
          </div>
          <LinkButton to="/contact" variant="gold" size="lg" className="w-full shrink-0 sm:w-auto">
            Ask Our Team
          </LinkButton>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-4 py-14 sm:px-8 sm:py-16">
          <SectionHeading eyebrow="FAQs" title="Care questions answered" />
          <div className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
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
        </div>
      </section>
    </>
  );
}