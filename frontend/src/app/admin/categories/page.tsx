'use client';
import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { categoryMeta, products } from '@/data/products';
import { useStore } from '@/contexts/StoreContext';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

const styleCategories = ['Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Bob'];

export function AdminCategories() {
  const { pushToast } = useStore();
  const [ranges, setRanges] = useState([
  { key: 'human-hair', label: categoryMeta['human-hair'].label, blurb: categoryMeta['human-hair'].blurb },
  { key: 'futura', label: categoryMeta.futura.label, blurb: categoryMeta.futura.blurb }]
  );

  return (
    <>
      <AdminPageHeader
        title="Categories"
        body="Maintain the two product ranges and the style collections customers can browse."
        actions={
        <Button>
            <PlusIcon width={14} height={14} />
            Add Category
          </Button>
        } />
      

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="border border-ink/10 bg-white p-6">
          <h2 className="font-serif text-xl text-ink">Product ranges</h2>
          <form
            className="mt-6 space-y-7"
            onSubmit={(event) => {
              event.preventDefault();
              pushToast({ title: 'Categories saved.', tone: 'success' });
            }}>
            
            {ranges.map((range, index) =>
            <div key={range.key} className="space-y-4 border-b border-ink/10 pb-6 last:border-b-0 last:pb-0">
                <TextField
                label="Category Name"
                value={range.label}
                onChange={(event) =>
                setRanges((prev) =>
                prev.map((item, i) => i === index ? { ...item, label: event.target.value } : item)
                )
                } />
              
                <TextField
                label="Short Description"
                value={range.blurb}
                onChange={(event) =>
                setRanges((prev) =>
                prev.map((item, i) => i === index ? { ...item, blurb: event.target.value } : item)
                )
                } />
              
                <p className="text-xs text-ink/50">
                  {products.filter((p) => p.category === range.key).length} products in this range
                </p>
              </div>
            )}
            <Button type="submit">Save Categories</Button>
          </form>
        </section>

        <section className="border border-ink/10 bg-white">
          <h2 className="border-b border-ink/10 px-6 py-5 font-serif text-xl text-ink">Style collections</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Style', 'Products', 'Visible'].map((header) =>
                <th key={header} className="label-luxe px-6 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {styleCategories.map((style) =>
              <tr key={style}>
                  <td className="px-6 py-4 text-ink">{style}</td>
                  <td className="px-6 py-4 text-ink/65">
                    {products.filter((p) => p.style === style).length}
                  </td>
                  <td className="px-6 py-4">
                    <label className="flex items-center gap-2 text-xs text-ink/60">
                      <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-chestnut" />
                      Shown in navigation
                    </label>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>);

}