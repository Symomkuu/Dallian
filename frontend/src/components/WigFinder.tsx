'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { products } from '../data/products';
import { cx, formatKsh } from '../utils/format';
import { Button } from './ui/Button';

interface Step {
  key: 'style' | 'length' | 'texture' | 'color' | 'budget';
  question: string;
  options: {label: string;value: string;}[];
}

const steps: Step[] = [
{
  key: 'style',
  question: 'What style are you looking for?',
  options: [
  { label: 'Sleek & straight', value: 'Straight' },
  { label: 'Soft waves', value: 'Body Wave' },
  { label: 'Defined curls', value: 'Curly' },
  { label: 'A short bob', value: 'Bob' }]

},
{
  key: 'length',
  question: 'What length do you prefer?',
  options: [
  { label: 'Short — up to 14"', value: 'short' },
  { label: 'Mid — 16" to 22"', value: 'mid' },
  { label: 'Long — 24" and above', value: 'long' },
  { label: 'Open to anything', value: 'any' }]

},
{
  key: 'texture',
  question: 'Which range suits you?',
  options: [
  { label: 'Premium human hair', value: 'human-hair' },
  { label: 'Japanese Futura fibre', value: 'futura' },
  { label: 'Show me both', value: 'any' }]

},
{
  key: 'color',
  question: 'What is your preferred colour?',
  options: [
  { label: 'Natural Black', value: 'Natural Black' },
  { label: 'Chestnut tones', value: 'Chestnut' },
  { label: 'Honey Gold', value: 'Honey Gold' },
  { label: 'Not sure yet', value: 'any' }]

},
{
  key: 'budget',
  question: 'What is your budget?',
  options: [
  { label: 'Up to KSh 15,000', value: '15000' },
  { label: 'KSh 15,000 – 28,000', value: '28000' },
  { label: 'Above KSh 28,000', value: '99999' },
  { label: 'Show everything', value: 'any' }]

}];


export function WigFinder() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const matches = useMemo(() => {
    if (!done) return [];
    return products.
    filter((product) => {
      if (answers.style && product.style !== answers.style && answers.style !== 'any') {
        const waveish = answers.style === 'Body Wave' && product.style === 'Deep Wave';
        if (!waveish) return false;
      }
      if (answers.length && answers.length !== 'any') {
        const max = Math.max(...product.lengths);
        if (answers.length === 'short' && max > 16) return false;
        if (answers.length === 'mid' && (max < 16 || Math.min(...product.lengths) > 24)) return false;
        if (answers.length === 'long' && max < 24) return false;
      }
      if (answers.texture && answers.texture !== 'any' && product.category !== answers.texture) return false;
      if (answers.color && answers.color !== 'any') {
        const hasColor = product.colors.some((c) => c.name.includes(answers.color));
        if (!hasColor) return false;
      }
      if (answers.budget && answers.budget !== 'any' && product.price > Number(answers.budget)) return false;
      return true;
    }).
    slice(0, 3);
  }, [answers, done]);

  const step = steps[index];

  return (
    <div className="border border-gold/30 bg-ink text-cream">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-cream/10 p-8 lg:border-b-0 lg:border-r lg:p-12">
          <p className="label-luxe flex items-center gap-2 text-gold">
            <SparklesIcon width={14} height={14} />
            Wig Finder
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight text-cream sm:text-4xl">
            Find Your Perfect Wig
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-cream/60">
            Five simple questions and we will shortlist pieces from the collection that suit your look and
            budget. No account needed.
          </p>
          <div className="mt-8 flex items-center gap-2" aria-hidden="true">
            {steps.map((s, i) =>
            <span
              key={s.key}
              className={cx(
                'h-[3px] flex-1 transition-colors duration-300',
                done || i <= index ? 'bg-gold' : 'bg-cream/20'
              )} />

            )}
          </div>
        </div>

        <div className="p-8 lg:p-12">
          {!done ?
          <div>
              <p className="label-luxe text-cream/45">
                Question {index + 1} of {steps.length}
              </p>
              <h3 className="mt-3 font-serif text-2xl text-cream">{step.question}</h3>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {step.options.map((option) => {
                const selected = answers[step.key] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [step.key]: option.value }))}
                    className={cx(
                      'border px-4 py-4 text-left text-sm transition-colors duration-200',
                      selected ?
                      'border-gold bg-gold/12 text-cream' :
                      'border-cream/20 text-cream/70 hover:border-cream/50 hover:text-cream'
                    )}>
                    
                      {option.label}
                    </button>);

              })}
              </div>
              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                type="button"
                disabled={index === 0}
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                className="label-luxe flex items-center gap-2 text-cream/55 transition-colors duration-200 hover:text-cream disabled:opacity-30">
                
                  <ArrowLeftIcon width={14} height={14} />
                  Back
                </button>
                <Button
                variant="gold"
                disabled={!answers[step.key]}
                onClick={() => index === steps.length - 1 ? setDone(true) : setIndex((i) => i + 1)}>
                
                  {index === steps.length - 1 ? 'See Matches' : 'Next'}
                  <ArrowRightIcon width={14} height={14} />
                </Button>
              </div>
            </div> :

          <div>
              <p className="label-luxe text-gold">Your Matches</p>
              <h3 className="mt-3 font-serif text-2xl text-cream">
                {matches.length > 0 ? 'Pieces we think you will love' : 'Let us help you in person'}
              </h3>
              {matches.length > 0 ?
            <ul className="mt-6 space-y-3">
                  {matches.map((product) =>
              <li key={product.id}>
                      <Link
                  to={`/product/${product.slug}`}
                  className="flex items-center gap-4 border border-cream/15 p-3 transition-colors duration-200 hover:border-gold/60">
                  
                        <img src={product.images[0]} alt="" className="h-20 w-16 object-cover" loading="lazy" />
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-lg text-cream">{product.name}</span>
                          <span className="block text-xs text-cream/55">
                            {product.style} · {product.category === 'human-hair' ? 'Human Hair' : 'Futura'}
                          </span>
                        </span>
                        <span className="text-sm text-gold">{formatKsh(product.price)}</span>
                      </Link>
                    </li>
              )}
                </ul> :

            <p className="mt-5 text-sm leading-relaxed text-cream/60">
                  Nothing in stock matches every answer right now. Talk to our team on WhatsApp and we will
                  recommend the closest piece, or browse the full collection.
                </p>
            }
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                variant="onDark"
                onClick={() => {
                  setDone(false);
                  setIndex(0);
                  setAnswers({});
                }}>
                
                  Start Again
                </Button>
                <Link
                to="/shop"
                className="label-luxe inline-flex h-11 items-center px-2 text-cream/60 hover:text-gold">
                
                  Browse Everything
                </Link>
              </div>
            </div>
          }
        </div>
      </div>
    </div>);

}