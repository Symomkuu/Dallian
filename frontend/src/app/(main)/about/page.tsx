import React from 'react';
import { MapPinIcon } from 'lucide-react';
import { brand, imagery } from '@/data/brand';
import { PageHeader } from '@/components/PageHeader';
import { SectionHeading } from '@/components/SectionHeading';
import { LinkButton } from '@/components/ui/Button';
import { Newsletter } from '@/components/Newsletter';

const pillars = [
  {
    title: 'Japanese Futura Fibre Wigs',
    body: 'A high-grade fibre range that holds its style with very little effort — ideal for everyday wear and for anyone who wants a ready-to-wear look.',
  },
  {
    title: 'Premium Human Hair Wigs',
    body: 'Real hair you can wash, style and treat like your own, chosen for finish, density and how it wears over time.',
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title="Your Destination for Luxury Hair"
        body="Dallian Luxe Hair is a Nairobi wig house built around one idea: beautiful hair should feel like an easy, confident choice."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'About Us' }]}
      />

      <section aria-labelledby="story-heading" className="mx-auto max-w-page px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img
            src={imagery.aboutStory}
            alt="A stylist preparing a premium wig in the Dallian Luxe Hair store"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />

          <div>
            <SectionHeading
              eyebrow="Our Story"
              title="Built on careful selection, not volume"
              body="We started Dallian Luxe Hair because finding a genuinely good wig should not be a gamble. Every piece in the collection is chosen by our team, and every customer is guided on length, texture and fit rather than left to guess."
            />

            <p className="mt-5 text-sm leading-relaxed text-ink/65">
              Our tagline — {brand.tagline} — is how we work. We would rather help you choose one piece you love and wear often than sell you something that sits in a box.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="ranges-heading" className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8 lg:py-20">
          <SectionHeading eyebrow="What We Offer" title="Two ranges, clearly explained" />
          <ul className="mt-10 grid gap-px border border-ink/10 bg-ink/10 lg:grid-cols-2">
            {pillars.map((pillar) => (
              <li key={pillar.title} className="bg-white p-9">
                <h3 className="font-serif text-2xl text-ink">{pillar.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/65">{pillar.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="visit-heading" className="relative bg-ink">
        <img
          src={imagery.store}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />

        <div className="relative mx-auto max-w-page px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-xl">
            <p className="label-luxe text-gold">Find Us</p>
            <h2 id="visit-heading" className="mt-4 font-serif text-3xl leading-tight text-cream sm:text-4xl">
              Our store in Nairobi
            </h2>
            <p className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-cream/75">
              <MapPinIcon width={16} height={16} className="mt-0.5 shrink-0 text-gold" />
              {brand.addressLine1}, {brand.addressLine2}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-cream/65">
              Come in to compare textures and lengths in person, or talk to us before you order online — we are happy to advise.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton to="/contact" variant="gold">
                Contact Us
              </LinkButton>
              <LinkButton to="/" variant="onDark">
                Shop the Collection
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}