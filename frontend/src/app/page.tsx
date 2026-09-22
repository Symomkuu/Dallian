import Link from 'next/link';
import {
  ArrowRight as ArrowRightIcon,
  Clock as ClockIcon,
  Headphones as HeadphonesIcon,
  MapPin as MapPinIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
  Store as StoreIcon,
  Truck as TruckIcon,
} from 'lucide-react';

import { brand, imagery } from '@/data/brand';
import { categoryMeta, products } from '@/data/products';
import { careGuide, reviews, trustPoints } from '@/data/content';

import { Hero } from '@/components/Hero';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductCard } from '@/components/ProductCard';
import { SectionHeading } from '@/components/SectionHeading';
import { WigFinder } from '@/components/WigFinder';
import { ReviewCard } from '@/components/ReviewCard';
import { Newsletter } from '@/components/Newsletter';
import { LinkButton } from '@/components/ui/Button';

const trustIcons: Record<string, React.ElementType> = {
  shield: ShieldCheckIcon,
  sparkles: SparklesIcon,
  headset: HeadphonesIcon,
  truck: TruckIcon,
  store: StoreIcon,
};

export default function Home() {
  const featured = products.filter((p) =>
    p.badges.includes('featured')
  );

  const bestSellers = products.filter((p) =>
    p.badges.includes('bestseller')
  );

  const published = reviews
    .filter((r) => r.status === 'published')
    .slice(0, 3);

  return (
    <>
      <Hero />

      <section
        aria-labelledby="categories-heading"
        className="mx-auto max-w-page px-5 py-16 sm:px-8 lg:py-24"
      >
        <SectionHeading
          eyebrow="Shop by Category"
          title="Two ranges, one standard of finish"
          body="Choose the range that suits how you wear your hair — real human hair you can style freely, or Japanese Futura fibre that holds its shape with almost no effort."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <CategoryCard
            eyebrow="Range 01"
            title={categoryMeta['human-hair'].label}
            body={categoryMeta['human-hair'].blurb}
            cta={categoryMeta['human-hair'].cta}
            to="/shop?category=human-hair"
            image={categoryMeta['human-hair'].image}
          />

          <CategoryCard
            eyebrow="Range 02"
            title={categoryMeta.futura.label}
            body={categoryMeta.futura.blurb}
            cta={categoryMeta.futura.cta}
            to="/shop?category=futura"
            image={categoryMeta.futura.image}
          />
        </div>
      </section>

      <section
        aria-labelledby="featured-heading"
        className="border-y border-ink/10 bg-white"
      >
        <div className="mx-auto max-w-page px-5 py-16 sm:px-8 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Signature"
              title="Shop Our Signature Collection"
            />

            <Link
              href="/shop"
              className="label-luxe inline-flex items-center gap-2 border-b border-gold pb-1.5 text-ink transition-colors duration-200 hover:text-chestnut"
            >
              View all pieces
              <ArrowRightIcon width={14} height={14} />
            </Link>
          </div>

          <div className="mt-10">
            <ProductGrid products={featured} columns={3} />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="why-heading"
        className="bg-cream"
      >
        <div className="mx-auto max-w-page px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Why Dallian Luxe Hair"
            title="Considered choices, from selection to delivery"
            align="center"
          />

          <ul className="mt-12 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {trustPoints.map((point) => {
              const Icon = trustIcons[point.icon];

              return (
                <li
                  key={point.title}
                  className="flex flex-col bg-cream p-8"
                >
                  <Icon
                    width={20}
                    height={20}
                    className="text-gold"
                  />

                  <h3 className="mt-5 font-serif text-xl text-ink">
                    {point.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-ink/60">
                    {point.body}
                  </p>
                </li>
              );
            })}

            <li className="flex flex-col justify-between bg-chestnut-deep p-8 text-cream">
              <div>
                <p className="label-luxe text-gold-light">
                  Visit
                </p>

                <h3 className="mt-4 font-serif text-xl">
                  See the collection in person
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-cream/70">
                  {brand.addressLine1}, {brand.addressLine2}
                </p>
              </div>

              <LinkButton
                to="/contact"
                variant="onDark"
                size="sm"
                className="mt-7 self-start"
              >
                Get Directions
              </LinkButton>
            </li>
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="best-heading"
        className="border-y border-ink/10 bg-white"
      >
        <div className="mx-auto max-w-page px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Best Sellers"
            title="The pieces our customers keep returning for"
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-label="Find your perfect wig"
        className="mx-auto max-w-page px-5 py-16 sm:px-8 lg:py-24"
      >
        <WigFinder />
      </section>

      <section
        aria-labelledby="reviews-heading"
        className="bg-ink"
      >
        <div className="mx-auto max-w-page px-5 py-16 sm:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Customer Reviews"
            title="In their words"
            onDark
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {published.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onDark
              />
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="care-heading"
        className="bg-cream"
      >
        <div className="mx-auto grid max-w-page items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <img
            src={imagery.care}
            alt="Wig care essentials arranged on a marble surface"
            loading="lazy"
            className="aspect-[3/2] w-full object-cover"
          />

          <div>
            <SectionHeading
              eyebrow="Wig Care"
              title="Keep your piece looking new"
              body="Washing, storage, detangling and curl maintenance — the routines that protect your investment, written for both human hair and Futura fibre."
            />

            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {careGuide.slice(0, 4).map((topic) => (
                <li
                  key={topic.title}
                  className="py-3.5 text-sm text-ink/70"
                >
                  {topic.title}
                </li>
              ))}
            </ul>

            <LinkButton
              to="/wig-care"
              className="mt-8"
            >
              Read the Care Guide
            </LinkButton>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="store-heading"
        className="relative bg-ink"
      >
        <img
          src={imagery.store}
          alt="Inside the Dallian Luxe Hair store"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="relative mx-auto max-w-page px-5 py-20 sm:px-8 lg:py-28">
          <div className="max-w-lg">
            <p className="label-luxe text-gold">
              Visit Our Store
            </p>

            <h2
              id="store-heading"
              className="mt-4 font-serif text-3xl leading-tight text-cream sm:text-4xl"
            >
              Mountain Mall, Thika Road
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              Try pieces on, compare lengths and colours in
              person, and get sizing advice from our team in
              Nairobi.
            </p>

            <dl className="mt-8 space-y-3 text-sm text-cream/75">
              <div className="flex items-start gap-3">
                <dt>
                  <MapPinIcon
                    width={16}
                    height={16}
                    className="mt-0.5 text-gold"
                  />
                  <span className="sr-only">
                    Address
                  </span>
                </dt>

                <dd>
                  {brand.addressLine1}, {brand.addressLine2}
                </dd>
              </div>

              <div className="flex items-start gap-3">
                <dt>
                  <ClockIcon
                    width={16}
                    height={16}
                    className="mt-0.5 text-gold"
                  />
                  <span className="sr-only">
                    Opening hours
                  </span>
                </dt>

                <dd>
                  {brand.hours.map((entry) => (
                    <span
                      key={entry.day}
                      className="block"
                    >
                      {entry.day} — {entry.time}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <LinkButton
                to="/contact"
                variant="gold"
              >
                Contact Us
              </LinkButton>

              <a
                href={`https://wa.me/${brand.phoneIntl}`}
                target="_blank"
                rel="noreferrer"
                className="label-luxe inline-flex h-11 items-center border border-gold/60 px-6 text-cream transition-colors duration-200 hover:bg-gold hover:text-ink"
              >
                WhatsApp {brand.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}