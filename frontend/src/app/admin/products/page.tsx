import React, { useMemo, useState } from 'react';
import { ImagePlusIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, XIcon } from 'lucide-react';
import { products as catalogue } from '../../data/products';
import type { Product } from '../../types';
import { useStore } from '../../contexts/StoreContext';
import { availabilityLabel, cx, formatKsh } from '../../utils/format';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { SelectField } from '../../components/ui/SelectField';

export function AdminProducts() {
  const { pushToast } = useStore();
  const [rows, setRows] = useState<Product[]>(catalogue);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const filtered = useMemo(
    () =>
    rows.filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (query && !product.name.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }),
    [rows, query, category]
  );

  const remove = (id: string) => {
    setRows((prev) => prev.filter((p) => p.id !== id));
    pushToast({ title: 'Product deleted.', tone: 'info' });
  };

  const toggleFlag = (id: string, flag: 'featured' | 'new') => {
    setRows((prev) =>
    prev.map((product) =>
    product.id === id ?
    {
      ...product,
      badges: product.badges.includes(flag) ?
      product.badges.filter((b) => b !== flag) :
      [...product.badges, flag]
    } :
    product
    )
    );
  };

  return (
    <>
      <AdminPageHeader
        title="Products"
        body="Add, edit and publish pieces. Variant inventory is tracked per length, colour and cap type."
        actions={
        <Button onClick={() => setEditing('new')}>
            <PlusIcon width={14} height={14} />
            Add Product
          </Button>
        } />
      

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="relative min-w-56 flex-1">
          <label htmlFor="product-search" className="label-luxe text-ink/60">
            Search products
          </label>
          <SearchIcon
            width={15}
            height={15}
            className="pointer-events-none absolute bottom-3.5 left-3.5 text-ink/40" />
          
          <input
            id="product-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name"
            className="mt-1.5 h-11 w-full border border-ink/20 bg-white pl-10 pr-4 text-sm focus:border-chestnut focus:outline-none" />
          
        </div>
        <SelectField
          label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-52"
          options={[
          { value: 'all', label: 'All categories' },
          { value: 'human-hair', label: 'Premium Human Hair' },
          { value: 'futura', label: 'Japanese Futura' }]
          } />
        
      </div>

      <div className="border border-ink/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left">
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Flags', ''].map((header) =>
                <th key={header} className="label-luxe px-5 py-3.5 text-ink/50">
                    {header}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {filtered.map((product) =>
              <tr key={product.id} className="transition-colors duration-150 hover:bg-cream/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.images[0]} alt="" className="h-14 w-11 object-cover" loading="lazy" />
                      <div>
                        <p className="font-serif text-base text-ink">{product.name}</p>
                        <p className="text-xs text-ink/50">
                          {product.id} · {product.style}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink/70">
                    {product.category === 'human-hair' ? 'Human Hair' : 'Japanese Futura'}
                  </td>
                  <td className="px-5 py-4 text-ink">{formatKsh(product.price)}</td>
                  <td className="px-5 py-4 text-ink/70">{product.stock}</td>
                  <td className="px-5 py-4">
                    <span
                    className={cx(
                      'px-2.5 py-1 text-[11px]',
                      product.availability === 'in-stock' && 'bg-emerald-50 text-emerald-800',
                      product.availability === 'low-stock' && 'bg-gold/20 text-ink',
                      product.availability === 'out-of-stock' && 'bg-red-50 text-red-700'
                    )}>
                    
                      {availabilityLabel(product.availability)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      {(['featured', 'new'] as const).map((flag) =>
                    <button
                      key={flag}
                      type="button"
                      onClick={() => toggleFlag(product.id, flag)}
                      className={cx(
                        'border px-2 py-1 text-[10px] uppercase tracking-wide transition-colors duration-200',
                        product.badges.includes(flag) ?
                        'border-gold bg-gold/20 text-ink' :
                        'border-ink/15 text-ink/45 hover:border-ink/40'
                      )}>
                      
                          {flag}
                        </button>
                    )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                      type="button"
                      onClick={() => setEditing(product)}
                      aria-label={`Edit ${product.name}`}
                      className="p-2 text-ink/55 transition-colors duration-150 hover:text-chestnut">
                      
                        <PencilIcon width={15} height={15} />
                      </button>
                      <button
                      type="button"
                      onClick={() => remove(product.id)}
                      aria-label={`Delete ${product.name}`}
                      className="p-2 text-ink/55 transition-colors duration-150 hover:text-red-700">
                      
                        <Trash2Icon width={15} height={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 &&
        <p className="px-5 py-10 text-center text-sm text-ink/55">No products match those filters.</p>
        }
      </div>

      {editing &&
      <div className="fixed inset-0 z-[60]">
          <button
          type="button"
          aria-label="Close editor"
          onClick={() => setEditing(null)}
          className="absolute inset-0 bg-ink/55" />
        
          <div className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-cream shadow-panel">
            <div className="sticky top-0 flex items-center justify-between border-b border-ink/10 bg-cream px-6 py-5">
              <h2 className="font-serif text-2xl text-ink">
                {editing === 'new' ? 'Add Product' : `Edit ${editing.name}`}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close editor" className="p-1.5">
                <XIcon width={20} height={20} />
              </button>
            </div>

            <form
            className="px-6 py-6"
            onSubmit={(event) => {
              event.preventDefault();
              pushToast({
                title: editing === 'new' ? 'Product created.' : 'Product updated.',
                tone: 'success'
              });
              setEditing(null);
            }}>
            
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                label="Product Name"
                defaultValue={editing === 'new' ? '' : editing.name}
                className="sm:col-span-2" />
              
                <SelectField
                label="Category"
                defaultValue={editing === 'new' ? 'human-hair' : editing.category}
                options={[
                { value: 'human-hair', label: 'Premium Human Hair' },
                { value: 'futura', label: 'Japanese Futura' }]
                } />
              
                <SelectField
                label="Product Status"
                defaultValue="published"
                options={[
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' }]
                } />
              
                <TextField label="Price (KSh)" type="number" defaultValue={editing === 'new' ? '' : editing.price} />
                <TextField label="Stock" type="number" defaultValue={editing === 'new' ? '' : editing.stock} />
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="product-description" className="label-luxe text-ink/60">
                    Description
                  </label>
                  <textarea
                  id="product-description"
                  rows={4}
                  defaultValue={editing === 'new' ? '' : editing.description}
                  className="border border-ink/20 bg-white px-4 py-3 text-sm focus:border-chestnut focus:outline-none" />
                
                </div>
                <TextField
                label="Lengths (inches, comma separated)"
                defaultValue={editing === 'new' ? '' : editing.lengths.join(', ')}
                className="sm:col-span-2" />
              
                <TextField
                label="Colours (comma separated)"
                defaultValue={editing === 'new' ? '' : editing.colors.map((c) => c.name).join(', ')}
                className="sm:col-span-2" />
              
                <TextField
                label="Cap Types (comma separated)"
                defaultValue={editing === 'new' ? '' : editing.capTypes.join(', ')}
                className="sm:col-span-2" />
              
                <TextField
                label="Specifications (label: value per line)"
                defaultValue={
                editing === 'new' ? '' : editing.specifications.map((s) => `${s.label}: ${s.value}`).join(' | ')
                }
                className="sm:col-span-2" />
              
              </div>

              <div className="mt-7">
                <p className="label-luxe text-ink/60">Images</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {(editing === 'new' ? [] : editing.images).map((image) =>
                <img key={image} src={image} alt="" className="h-24 w-20 border border-ink/15 object-cover" />
                )}
                  <button
                  type="button"
                  className="flex h-24 w-20 flex-col items-center justify-center gap-1.5 border border-dashed border-ink/25 text-[10px] uppercase tracking-wide text-ink/50 transition-colors duration-200 hover:border-chestnut hover:text-chestnut">
                  
                    <ImagePlusIcon width={16} height={16} />
                    Upload
                  </button>
                </div>
              </div>

              <div className="mt-8 border border-ink/10 bg-white p-5">
                <h3 className="font-serif text-lg text-ink">Variants</h3>
                <p className="mt-1 text-xs text-ink/55">
                  Inventory is tracked for each combination of length, colour and cap type.
                </p>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 text-left">
                        {['Length', 'Colour', 'Cap', 'Stock'].map((header) =>
                      <th key={header} className="label-luxe py-2.5 text-ink/50">
                            {header}
                          </th>
                      )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/8">
                      {(editing === 'new' ? [] : editing.lengths.slice(0, 3)).map((length) =>
                    <tr key={length}>
                          <td className="py-3 text-ink/75">{length} in</td>
                          <td className="py-3 text-ink/75">{editing !== 'new' && editing.colors[0].name}</td>
                          <td className="py-3 text-ink/75">{editing !== 'new' && editing.capTypes[0]}</td>
                          <td className="py-3">
                            <input
                          type="number"
                          defaultValue={editing === 'new' ? 0 : Math.max(0, Math.round(editing.stock / 3))}
                          aria-label={`Stock for ${length} inch`}
                          className="h-9 w-20 border border-ink/20 px-2 text-sm focus:border-chestnut focus:outline-none" />
                        
                          </td>
                        </tr>
                    )}
                    </tbody>
                  </table>
                </div>
                <Button variant="secondary" size="sm" className="mt-4" type="button">
                  <PlusIcon width={13} height={13} />
                  Add Variant
                </Button>
              </div>

              <div className="mt-8 flex gap-3">
                <Button type="submit" size="lg">
                  {editing === 'new' ? 'Create Product' : 'Save Changes'}
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      }
    </>);

}