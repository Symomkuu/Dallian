'use client';

import React, { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button } from './ui/Button';

export function Newsletter() {
  const { pushToast } = useStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  return (
    <section aria-labelledby="newsletter-heading" className="bg-chestnut-deep">
      <div className="mx-auto max-w-page px-5 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="label-luxe text-gold-light">Dallian Circle</p>
          <h2 id="newsletter-heading" className="mt-3 font-serif text-3xl text-cream sm:text-4xl">
            New arrivals, first look
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/70">
            Join our list for new collection drops and care tips. We only send what is worth opening.
          </p>

          {done ?
          <p className="mt-8 inline-flex items-center gap-2 border border-gold/50 px-5 py-3 text-sm text-cream">
              <CheckIcon width={16} height={16} className="text-gold" />
              You are on the list. Thank you.
            </p> :

          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                setError('Enter a valid email address so we can reach you.');
                return;
              }
              setError('');
              setDone(true);
              pushToast({ title: 'Subscribed.', body: 'Welcome to the Dallian Circle.', tone: 'success' });
            }}
            className="mt-8">
            
              <div className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Your email address"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
                className="h-12 flex-1 border border-cream/25 bg-transparent px-4 text-sm text-cream placeholder:text-cream/45 focus:border-gold focus:outline-none" />
              
                <Button type="submit" variant="gold" size="md" className="sm:w-40">
                  Subscribe
                </Button>
              </div>
              {error &&
            <p id="newsletter-error" className="mt-3 text-xs text-gold-light">
                  {error}
                </p>
            }
            </form>
          }
        </div>
      </div>
    </section>);

}