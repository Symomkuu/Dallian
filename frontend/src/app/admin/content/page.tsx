'use client';
import React, { useState } from 'react';
import { faqs, policyPages } from '@/data/content';
import { useStore } from '@/contexts/StoreContext';
import { cx } from '@/utils/format';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';

const tabs = ['FAQ', 'Policies', 'Homepage'] as const;

export function AdminContent() {
  const { pushToast } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>('FAQ');

  return (
    <>
      <AdminPageHeader
        title="Content"
        body="Edit the copy customers read — FAQ answers, policy pages and homepage messaging." />
      

      <div className="flex gap-1 border-b border-ink/10">
        {tabs.map((option) =>
        <button
          key={option}
          type="button"
          onClick={() => setTab(option)}
          aria-current={tab === option}
          className={cx(
            'label-luxe -mb-px border-b-2 px-4 py-3 transition-colors duration-200',
            tab === option ? 'border-gold text-ink' : 'border-transparent text-ink/45 hover:text-ink'
          )}>
          
            {option}
          </button>
        )}
      </div>

      <form
        className="mt-6"
        onSubmit={(event) => {
          event.preventDefault();
          pushToast({ title: 'Content saved.', tone: 'success' });
        }}>
        
        {tab === 'FAQ' &&
        <ul className="space-y-4">
            {faqs.slice(0, 6).map((faq, index) =>
          <li key={faq.question} className="border border-ink/10 bg-white p-5">
                <label htmlFor={`faq-q-${index}`} className="label-luxe text-ink/55">
                  Question
                </label>
                <input
              id={`faq-q-${index}`}
              defaultValue={faq.question}
              className="mt-1.5 h-11 w-full border border-ink/20 px-4 text-sm focus:border-chestnut focus:outline-none" />
            
                <label htmlFor={`faq-a-${index}`} className="label-luxe mt-4 block text-ink/55">
                  Answer
                </label>
                <textarea
              id={`faq-a-${index}`}
              rows={3}
              defaultValue={faq.answer}
              className="mt-1.5 w-full border border-ink/20 px-4 py-3 text-sm focus:border-chestnut focus:outline-none" />
            
              </li>
          )}
          </ul>
        }

        {tab === 'Policies' &&
        <ul className="space-y-4">
            {(Object.keys(policyPages) as (keyof typeof policyPages)[]).map((key) =>
          <li key={key} className="border border-ink/10 bg-white p-5">
                <p className="font-serif text-lg text-ink">{policyPages[key].title}</p>
                <label htmlFor={`policy-${key}`} className="label-luxe mt-4 block text-ink/55">
                  Introduction
                </label>
                <textarea
              id={`policy-${key}`}
              rows={3}
              defaultValue={policyPages[key].intro}
              className="mt-1.5 w-full border border-ink/20 px-4 py-3 text-sm focus:border-chestnut focus:outline-none" />
            
                <p className="mt-3 text-xs text-ink/50">
                  {policyPages[key].sections.length} sections on this page
                </p>
              </li>
          )}
          </ul>
        }

        {tab === 'Homepage' &&
        <div className="space-y-4">
            {[
          { label: 'Announcement bar', value: 'Premium Wigs • Elegant Looks • Shop Dallian Luxe Hair' },
          { label: 'Hero headline', value: 'Luxury Hair. Effortless Confidence.' },
          {
            label: 'Hero supporting text',
            value: 'Discover premium human hair and Japanese Futura fibre wigs designed to elevate your look.'
          },
          { label: 'Featured collection title', value: 'Shop Our Signature Collection' }].
          map((field) =>
          <div key={field.label} className="border border-ink/10 bg-white p-5">
                <label htmlFor={field.label} className="label-luxe text-ink/55">
                  {field.label}
                </label>
                <input
              id={field.label}
              defaultValue={field.value}
              className="mt-1.5 h-11 w-full border border-ink/20 px-4 text-sm focus:border-chestnut focus:outline-none" />
            
              </div>
          )}
          </div>
        }

        <Button type="submit" size="lg" className="mt-6">
          Save Content
        </Button>
      </form>
    </>);

}