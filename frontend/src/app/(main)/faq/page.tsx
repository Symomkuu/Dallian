'use client';

import { Link } from '@/components/RouterCompat';
import { faqs } from '@/data/content';
import { Accordion } from '@/components/ui/Accordion';
import { LinkButton } from '@/components/ui/Button';

export default function FAQ() {
  return (
    <>

      <div className="mx-auto grid max-w-page gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.4fr_0.6fr] lg:gap-16 lg:py-14">
        <div>
          <Accordion
            defaultOpen={0}
            items={faqs.map((faq) => ({ title: faq.question, content: <p>{faq.answer}</p> }))} />
          
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
              { label: 'Track Your Order', to: '/track' }].
              map((link) =>
              <li key={link.to}>
                  <Link to={link.to} className="text-ink/70 underline-offset-4 hover:text-chestnut hover:underline">
                    {link.label}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </>);

}