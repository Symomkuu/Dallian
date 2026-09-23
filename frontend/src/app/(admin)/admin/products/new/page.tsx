'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, ImageIcon, UploadIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatKsh } from '@/utils/format';
import type { Category, HairStyle } from '@/types';

const steps = ['Basic Info', 'Images', 'Pricing & Stock', 'Preview'] as const;
type Step = (typeof steps)[number];

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'human-hair', label: 'Human Hair' },
  { value: 'futura', label: 'Japanese Futura' },
];

const styleOptions: HairStyle[] = ['Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Bob'];

const inputClass =
  'w-full border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-chestnut focus:outline-none';
const labelClass = 'mb-1.5 block text-sm font-medium text-ink';

interface ImagePreview {
  file: File;
  url: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { pushToast } = useStore();
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = steps[stepIndex];
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [style, setStyle] = useState<HairStyle | ''>('');

  const [images, setImages] = useState<ImagePreview[]>([]);

  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [featured, setFeatured] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Revoke object URLs on unmount so previews don't leak memory.
    return () => images.forEach((image) => URL.revokeObjectURL(image.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateStep = (target: Step) => {
    const next: Record<string, string> = {};
    if (target === 'Basic Info') {
      if (!name.trim()) next.name = 'Enter a product name.';
      if (!category) next.category = 'Select a category.';
      if (!style) next.style = 'Select a style.';
    }
    if (target === 'Images' && images.length === 0) {
      next.images = 'Add at least one product photo.';
    }
    if (target === 'Pricing & Stock') {
      if (!price || Number(price) <= 0) next.price = 'Enter a selling price.';
      if (!stock || Number(stock) < 0) next.stock = 'Enter the stock quantity.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goPrevious = () => setStepIndex((i) => Math.max(i - 1, 0));

  const goToStep = (index: number) => {
    // Only allow jumping to a step you've already reached, or one step ahead
    // (which re-validates the current step first).
    if (index <= stepIndex) {
      setStepIndex(index);
    } else if (validateStep(step)) {
      setStepIndex(index);
    }
  };

  const handleCreate = async () => {
    if (!validateStep('Pricing & Stock')) {
      setStepIndex(2);
      return;
    }
    setSubmitting(true);
    // No backend endpoint exists yet for creating products, so this simply
    // confirms the flow and returns to the catalogue.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitting(false);
    pushToast({ title: 'Product created.', body: `${name} was added to your catalogue.`, tone: 'success' });
    router.push('/admin/products');
  };

  const previewPrice = Number(price) || 0;
  const previewCompareAt = Number(compareAtPrice) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-luxe text-chestnut">Products</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">Add New Product</h1>
        </div>
        <p className="text-xs text-ink/45">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto border-b border-ink/10 pb-3">
        {steps.map((label, index) => {
          const active = index === stepIndex;
          const done = index < stepIndex;
          return (
            <button
              key={label}
              type="button"
              onClick={() => goToStep(index)}
              className={cx(
                'flex shrink-0 items-center gap-2 border-b-2 pb-2 text-sm transition-colors duration-200',
                active ? 'border-chestnut text-chestnut' : 'border-transparent text-ink/45 hover:text-ink/70'
              )}
            >
              <span
                className={cx(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                  done ? 'bg-chestnut text-white' : active ? 'border border-chestnut text-chestnut' : 'border border-ink/25'
                )}
              >
                {done ? <CheckIcon width={11} height={11} /> : index + 1}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      <div className="border border-ink/10 bg-white p-5 sm:p-6">
        {step === 'Basic Info' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="font-serif text-lg text-ink">Basic Information</h2>
            <div>
              <label className={labelClass} htmlFor="product-name">
                Product Name
              </label>
              <input
                id="product-name"
                className={inputClass}
                placeholder="e.g. Luxury Body Wave"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-700">{errors.name}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="product-description">
                Description
              </label>
              <textarea
                id="product-description"
                rows={5}
                className={cx(inputClass, 'resize-y')}
                placeholder="Describe the piece — texture, finish, what makes it stand out."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="product-category">
                  Category
                </label>
                <select
                  id="product-category"
                  className={inputClass}
                  value={category}
                  onChange={(event) => setCategory(event.target.value as Category)}
                >
                  <option value="">— Select a category —</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1.5 text-xs text-red-700">{errors.category}</p>}
              </div>

              <div>
                <label className={labelClass} htmlFor="product-style">
                  Style
                </label>
                <select
                  id="product-style"
                  className={inputClass}
                  value={style}
                  onChange={(event) => setStyle(event.target.value as HairStyle)}
                >
                  <option value="">— Select a style —</option>
                  {styleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.style && <p className="mt-1.5 text-xs text-red-700">{errors.style}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 'Images' && (
          <div className="max-w-2xl space-y-4">
            <h2 className="font-serif text-lg text-ink">Product Images</h2>
            <label
              htmlFor="product-images"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-cream/40 px-6 py-10 text-center transition-colors duration-200 hover:border-chestnut"
            >
              <UploadIcon width={22} height={22} className="text-ink/40" />
              <span className="text-sm text-chestnut underline underline-offset-4">Choose files</span>
              <span className="text-xs text-ink/45">Upload product photos. Recommended: 1200x1200px</span>
              <input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => handleFiles(event.target.files)}
              />
            </label>
            {errors.images && <p className="text-xs text-red-700">{errors.images}</p>}

            {images.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={image.url} className="group relative aspect-square overflow-hidden border border-ink/10">
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-black px-1.5 py-0.5 text-[9px] tracking-wide text-white uppercase">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center bg-white/95 text-xs text-red-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink/45">
                  {images.length} file{images.length === 1 ? '' : 's'} selected — first image is the primary display image.
                </p>
              </>
            )}
          </div>
        )}

        {step === 'Pricing & Stock' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="font-serif text-lg text-ink">Price &amp; Stock</h2>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="product-price">
                    Selling Price (KES)
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="0.00"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                  />
                  {errors.price && <p className="mt-1.5 text-xs text-red-700">{errors.price}</p>}
                </div>
                <div>
                  <label className={labelClass} htmlFor="product-compare-price">
                    Price Before Discount (optional)
                  </label>
                  <input
                    id="product-compare-price"
                    type="number"
                    min={0}
                    className={inputClass}
                    placeholder="0.00"
                    value={compareAtPrice}
                    onChange={(event) => setCompareAtPrice(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="product-stock">
                Stock Quantity
              </label>
              <input
                id="product-stock"
                type="number"
                min={0}
                className={cx(inputClass, 'max-w-xs')}
                placeholder="0"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
              />
              {errors.stock && <p className="mt-1.5 text-xs text-red-700">{errors.stock}</p>}
            </div>

            <label className="flex items-center justify-between border border-ink/10 bg-cream/40 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-ink">Featured Product</span>
                <span className="block text-xs text-ink/50">Show on your shop homepage</span>
              </span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
                className="h-5 w-5 accent-chestnut"
              />
            </label>
          </div>
        )}

        {step === 'Preview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
            <div className="space-y-3 text-sm text-ink/70">
              <h2 className="font-serif text-lg text-ink">Review before publishing</h2>
              <dl className="space-y-2">
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 text-ink/45">Name</dt>
                  <dd>{name || '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 text-ink/45">Category</dt>
                  <dd>{categoryOptions.find((option) => option.value === category)?.label || '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 text-ink/45">Style</dt>
                  <dd>{style || '—'}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 text-ink/45">Price</dt>
                  <dd>{formatKsh(previewPrice)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 text-ink/45">Stock</dt>
                  <dd>{stock || '0'} units</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 text-ink/45">Featured</dt>
                  <dd>{featured ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-ink/10 bg-white">
              <div className="relative aspect-square bg-cream">
                {images[0] ? (
                  <img src={images[0].url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink/25">
                    <ImageIcon width={32} height={32} />
                  </div>
                )}
                {featured && (
                  <span className="absolute top-2 left-2 bg-black px-2 py-1 text-[10px] tracking-wider text-white uppercase">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-ink">{name || 'Product Name'}</p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  {previewCompareAt > 0 && (
                    <span className="text-xs text-ink/40 line-through">{formatKsh(previewCompareAt)}</span>
                  )}
                  <span className="text-sm font-semibold text-chestnut">{formatKsh(previewPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => (stepIndex === 0 ? router.push('/admin/products') : goPrevious())}
          className="border border-ink/20 px-5 py-2.5 text-xs tracking-widest text-ink/70 uppercase transition-colors duration-200 hover:bg-ink/5"
        >
          {stepIndex === 0 ? 'Cancel' : 'Previous'}
        </button>
        {step === 'Preview' ? (
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="bg-black px-6 py-2.5 text-xs tracking-widest text-white uppercase transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create Product'}
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="bg-black px-6 py-2.5 text-xs tracking-widest text-white uppercase transition-colors duration-200 hover:bg-neutral-800"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
