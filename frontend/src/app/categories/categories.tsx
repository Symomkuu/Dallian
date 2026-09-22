import React from 'react';
import { Link } from '@/components/RouterCompat';
import { categoryMeta, products } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { CategoryCard } from '../components/CategoryCard';
import { SectionHeading } from '../components/SectionHeading';
import { ProductCard } from '../components/ProductCard';

const styleCollections = [
{ label: 'Straight', blurb: 'Sleek, polished and easy to wear day to day.' },
{ label: 'Body Wave', blurb: 'Soft movement with a relaxed, natural fall.' },
{ label: 'Deep Wave', blurb: 'Sculpted definition and generous volume.' },
{ label: 'Curly', blurb: 'Springy curls with body and bounce.' },
{ label: 'Bob', blurb: 'A short, blunt silhouette with sharp edges.' }];


export function Categories() {
  return (
    <>
      <PageHeader
        eyebrow="Categories"
        title="Explore the Collection"
        body="Start with a range, or jump straight to the texture you already know suits you."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
      

      <section aria-labelledby="ranges-heading" className="mx-auto max-w-page px-5 py-14 sm:px-8">
        <SectionHeading eyebrow="By Range" title="Human hair or Japanese Futura" />
        <div className="mt-9 grid gap-5 sm:grid-cols-2">
          {(['human-hair', 'futura'] as const).map((key, index) =>
          <CategoryCard
            key={key}
            eyebrow={`Range 0${index + 1}`}
            title={categoryMeta[key].label}
            body={categoryMeta[key].blurb}
            cta={categoryMeta[key].cta}
            to={`/shop?category=${key}`}
            image={categoryMeta[key].image}
            tall />

          )}
        </div>
      </section>

      <section aria-labelledby="styles-heading" className="border-y border-ink/10 bg-white">
        <div className="mx-auto max-w-page px-5 py-14 sm:px-8">
          <SectionHeading eyebrow="By Style" title="Shop by texture" />
          <ul className="mt-9 grid gap-px border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {styleCollections.map((collection) => {
              const count = products.filter((p) => p.style === collection.label).length;
              return (
                <li key={collection.label} className="bg-white">
                  <Link
                    to={`/shop?style=${encodeURIComponent(collection.label)}`}
                    className="flex h-full flex-col p-8 transition-colors duration-200 hover:bg-cream">
                    
                    <span className="label-luxe text-gold">{count} pieces</span>
                    <span className="mt-4 font-serif text-2xl text-ink">{collection.label}</span>
                    <span className="mt-2 text-sm leading-relaxed text-ink/60">{collection.blurb}</span>
                  </Link>
                </li>);

            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="new-heading" className="mx-auto max-w-page px-5 py-14 sm:px-8 lg:py-20">
        <SectionHeading eyebrow="Just In" title="New arrivals" />
        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.
          filter((p) => p.badges.includes('new')).
          map((product) =>
          <ProductCard key={product.id} product={product} />
          )}
        </div>
      </section>
    </>);

}