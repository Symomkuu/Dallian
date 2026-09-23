'use client';

import React from 'react';
import { imagery } from '@/data/brand';
import { careGuide } from '@/data/content';
import { PageHeader } from '@/components/PageHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { LinkButton } from '@/components/ui/Button';

export default function WigCarePage() {
  return (
    <>
      <PageHeader
        eyebrow="Education"
        title="Wig Care Guide"
        body="Looking after a wig well is mostly routine. These are the habits that keep a piece soft, full and wearable for far longer."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Wig Care' }]} 
      />

      <section className="border-b border-ink/10 bg-white">
        <div className="mx-auto grid max-w-page items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-16">
          <img
            src={imagery.care}
            alt="Wig care essentials — comb, spray bottle, satin bag and wig stand"
            loading="lazy"
            className="aspect-[3/2] w-full object-cover" 
          />
          
          <SectionHeading
            eyebrow="Start Here"
            title="Three habits that matter most"
            body="Wash less often than you think, always dry on a stand, and detangle from the ends upward. Almost every problem customers bring back to us comes from skipping one of those three." 
          />
        </div>
      </section>

      <div className="mx-auto max-w-page px-5 py-12 sm:px-8 lg:py-16">
        <ol className="grid gap-px border border-ink/10 bg-ink/10 lg:grid-cols-2">
          {careGuide.map((topic, index) => (
            <li key={topic.title} className="bg-cream p-8">
              <p className="label-luxe text-gold">Step {String(index + 1).padStart(2, '0')}</p>
              <h2 className="mt-4 font-serif text-2xl leading-snug text-ink">{topic.title}</h2>
              <ul className="mt-5 space-y-3">
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
        <div className="mx-auto flex max-w-page flex-col items-start gap-6 px-5 py-14 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-serif text-2xl text-cream sm:text-3xl">Not sure which routine applies?</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-cream/70">
              Human hair and Futura fibre are cared for differently. Tell us which piece you have and we will
              walk you through it.
            </p>
          </div>
          <LinkButton to="/contact" variant="gold" size="lg" className="shrink-0">
            Ask Our Team
          </LinkButton>
        </div>
      </section>
    </>
  );
}