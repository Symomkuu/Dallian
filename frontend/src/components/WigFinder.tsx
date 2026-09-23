'use client';

import React, { useMemo, useState } from 'react';
import { Link } from '@/components/RouterCompat';
import { ArrowLeftIcon, ArrowRightIcon, SparklesIcon } from 'lucide-react';
import { products } from '../data/products';
import { cx, formatKsh } from '../utils/format';

interface Step {
  key: 'style' | 'length' | 'texture' | 'color' | 'budget';
  question: string;
  options: { label: string; value: string }[];
}

const steps: Step[] = [
  {
    key: 'style',
    question: 'What style are you looking for?',
    options: [
      { label: 'Sleek & straight', value: 'Straight' },
      { label: 'Soft waves', value: 'Body Wave' },
      { label: 'Defined curls', value: 'Curly' },
      { label: 'A short bob', value: 'Bob' },
    ],
  },
  {
    key: 'length',
    question: 'What length do you prefer?',
    options: [
      { label: 'Short — up to 14"', value: 'short' },
      { label: 'Mid — 16" to 22"', value: 'mid' },
      { label: 'Long — 24" and above', value: 'long' },
      { label: 'Open to anything', value: 'any' },
    ],
  },
  {
    key: 'texture',
    question: 'Which range suits you?',
    options: [
      { label: 'Premium human hair', value: 'human-hair' },
      { label: 'Japanese Futura fibre', value: 'futura' },
      { label: 'Show me both', value: 'any' },
    ],
  },
  {
    key: 'color',
    question: 'What is your preferred colour?',
    options: [
      { label: 'Natural Black', value: 'Natural Black' },
      { label: 'Chestnut tones', value: 'Chestnut' },
      { label: 'Honey Gold', value: 'Honey Gold' },
      { label: 'Not sure yet', value: 'any' },
    ],
  },
  {
    key: 'budget',
    question: 'What is your budget?',
    options: [
      { label: 'Up to KSh 15,000', value: '15000' },
      { label: 'KSh 15,000 – 28,000', value: '28000' },
      { label: 'Above KSh 28,000', value: '99999' },
      { label: 'Show everything', value: 'any' },
    ],
  },
];

export function WigFinder() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const matches = useMemo(() => {
    if (!done) return [];
    return products
      .filter((product) => {
        if (
          answers.style &&
          product.style !== answers.style &&
          answers.style !== 'any'
        ) {
          const waveish =
            answers.style === 'Body Wave' && product.style === 'Deep Wave';
          if (!waveish) return false;
        }
        if (answers.length && answers.length !== 'any') {
          const max = Math.max(...product.lengths);
          if (answers.length === 'short' && max > 16) return false;
          if (
            answers.length === 'mid' &&
            (max < 16 || Math.min(...product.lengths) > 24)
          )
            return false;
          if (answers.length === 'long' && max < 24) return false;
        }
        if (
          answers.texture &&
          answers.texture !== 'any' &&
          product.category !== answers.texture
        )
          return false;
        if (answers.color && answers.color !== 'any') {
          const hasColor = product.colors.some((c) =>
            c.name.includes(answers.color)
          );
          if (!hasColor) return false;
        }
        if (
          answers.budget &&
          answers.budget !== 'any' &&
          product.price > Number(answers.budget)
        )
          return false;
        return true;
      })
      .slice(0, 3);
  }, [answers, done]);

  const step = steps[index];

  return (
    <div className="w-full bg-[#0D0D0D] text-white">
      <div className="grid grid-cols-1 divide-y divide-white/10 lg:grid-cols-12 lg:divide-x lg:divide-y-0">
        {/* Left Panel */}
        <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-5 lg:p-14">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-[#C89D34]" />
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
                WIG FINDER
              </span>
            </div>

            <h2 className="mt-6 font-serif text-3xl font-normal text-white sm:text-4xl lg:text-5xl leading-tight">
              Find Your Perfect Wig
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
              Five simple questions and we will shortlist pieces from the
              collection that suit your look and budget. No account needed.
            </p>
          </div>

          {/* 5 Progress Bars */}
          <div className="mt-10 flex gap-2" aria-hidden="true">
            {steps.map((s, i) => (
              <div
                key={s.key}
                className="h-[2px] flex-1 bg-white/20 transition-all duration-300"
              >
                <div
                  className={cx(
                    'h-full transition-all duration-300',
                    done || i <= index ? 'bg-[#C89D34]' : 'bg-transparent'
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Interactive Quiz Panel */}
        <div className="flex flex-col justify-between p-8 sm:p-12 lg:col-span-7 lg:p-14">
          {!done ? (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gray-400">
                QUESTION {index + 1} OF {steps.length}
              </p>

              <h3 className="mt-3 font-serif text-2xl font-normal text-white sm:text-3xl">
                {step.question}
              </h3>

              {/* Options Grid */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {step.options.map((option) => {
                  const selected = answers[step.key] === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [step.key]: option.value,
                        }))
                      }
                      className={cx(
                        'flex items-center justify-start border p-4 text-left text-sm transition-all duration-200',
                        selected
                          ? 'border-[#C89D34] bg-[#C89D34]/10 text-white'
                          : 'border-white/10 bg-transparent text-gray-300 hover:border-white/30 hover:text-white'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="mt-12 flex items-center justify-between">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  className={cx(
                    'flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase transition-colors',
                    index === 0
                      ? 'invisible opacity-0'
                      : 'text-gray-400 hover:text-white'
                  )}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  BACK
                </button>

                <button
                  type="button"
                  disabled={!answers[step.key]}
                  onClick={() =>
                    index === steps.length - 1
                      ? setDone(true)
                      : setIndex((i) => i + 1)
                  }
                  className={cx(
                    'flex items-center gap-2 px-8 py-3.5 text-xs font-semibold tracking-[0.2em] uppercase transition-all',
                    answers[step.key]
                      ? 'bg-[#C89D34] text-black hover:bg-[#b0882a] cursor-pointer'
                      : 'bg-[#5A481B] text-black/50 cursor-not-allowed'
                  )}
                >
                  {index === steps.length - 1 ? 'SEE MATCHES' : 'NEXT'}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
                YOUR MATCHES
              </p>

              <h3 className="mt-3 font-serif text-2xl font-normal text-white sm:text-3xl">
                {matches.length > 0
                  ? 'Pieces we think you will love'
                  : 'Let us help you in person'}
              </h3>

              {matches.length > 0 ? (
                <ul className="mt-6 space-y-3">
                  {matches.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/product/${product.slug}`}
                        className="flex items-center gap-4 border border-white/10 p-3 transition-colors duration-200 hover:border-[#C89D34]"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-20 w-16 object-cover"
                          loading="lazy"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-lg text-white">
                            {product.name}
                          </span>
                          <span className="block text-xs text-gray-400">
                            {product.style} ·{' '}
                            {product.category === 'human-hair'
                              ? 'Human Hair'
                              : 'Futura'}
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-[#C89D34]">
                          {formatKsh(product.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-sm leading-relaxed text-gray-400">
                  Nothing in stock matches every answer right now. Talk to our
                  team on WhatsApp and we will recommend the closest piece, or
                  browse the full collection.
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setDone(false);
                    setIndex(0);
                    setAnswers({});
                  }}
                  className="border border-white/20 bg-transparent px-6 py-3 text-xs font-semibold tracking-widest uppercase text-white transition-colors hover:border-white"
                >
                  Start Again
                </button>

                <Link
                  to="/"
                  className="text-xs font-semibold tracking-widest uppercase text-gray-400 transition-colors hover:text-[#C89D34]"
                >
                  Browse Everything
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}