import Image from "next/image";
import { brand, imagery } from "../data/brand";

const collections = [
  {
    title: "Premium human hair",
    description: "Natural movement, soft texture and a finish made for everyday luxury.",
    image: imagery.categoryHumanHair,
  },
  {
    title: "Japanese Futura fibre",
    description: "Beautifully shaped styles that hold their look with effortless ease.",
    image: imagery.categoryFutura,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f1e5] text-[#171313]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div>
          <p className="label-luxe text-[#7a3f2b]">Dallian Luxe Hair</p>
          <p className="mt-1 text-sm text-[#6f6259]">{brand.tagline}</p>
        </div>
        <a
          href={`https://wa.me/${brand.phoneIntl}`}
          className="border-b border-[#171313] pb-1 text-sm font-medium transition-colors hover:text-[#7a3f2b]"
        >
          Chat with us
        </a>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-12">
        <div className="max-w-xl">
          <p className="label-luxe text-[#b18425]">Premium wigs · Nairobi</p>
          <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-tight sm:text-7xl">
            Your most beautiful look, made effortless.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-[#6f6259]">
            Discover thoughtfully selected wigs for soft glamour, confident days and every occasion in between.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a
              href="#collections"
              className="bg-[#171313] px-6 py-3 text-sm font-medium text-[#fffaf2] transition-colors hover:bg-[#7a3f2b]"
            >
              Explore the collection
            </a>
            <a
              href={`tel:${brand.phoneIntl}`}
              className="border border-[#c8b9a8] px-6 py-3 text-sm font-medium transition-colors hover:border-[#171313]"
            >
              Call {brand.phone}
            </a>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden bg-[#e7d7c5]">
          <Image
            src={imagery.hero}
            alt="Dallian Luxe Hair signature wig collection"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </section>

      <section id="collections" className="border-t border-[#d9cbbb] bg-[#fffaf2] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="label-luxe text-[#b18425]">Find your finish</p>
              <h2 className="mt-3 font-serif text-4xl">Made for your kind of beautiful.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#6f6259]">
              Visit us at {brand.addressLine1}, {brand.addressLine2} to see and try pieces in person.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {collections.map((collection) => (
              <article key={collection.title} className="group">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e7d7c5]">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-5 font-serif text-2xl">{collection.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#6f6259]">{collection.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
