'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, ImageIcon, UploadIcon } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatKsh } from '@/utils/format';
import InlineAddPanel from '@/components/admin/InlineAddPanel';
import { uploadImageToCloudinary } from '@/utils/cloudinary';
import {
  createDashboardCategory,
  createDashboardHairStyle,
  createDashboardProduct,
  createDashboardProductImage,
  fetchDashboardCategories,
  fetchDashboardHairStyles,
  type DashboardCategory,
  type DashboardHairStyle,
} from '@/utils/api';

const steps = ['Basic Info', 'Images', 'Pricing & Stock', 'Preview'] as const;
type Step = (typeof steps)[number];

const ADD_NEW_VALUE = '__add_new__';

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

  // ── Basic Info ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const [hairstyles, setHairstyles] = useState<DashboardHairStyle[]>([]);
  const [hairstyleId, setHairstyleId] = useState('');
  const [showAddHairstyle, setShowAddHairstyle] = useState(false);
  const [addingHairstyle, setAddingHairstyle] = useState(false);

  // ── Images ───────────────────────────────────────────────────────────────
  const [images, setImages] = useState<ImagePreview[]>([]);

  // ── Pricing & Stock ──────────────────────────────────────────────────────
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('');
  const [featured, setFeatured] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load categories & hairstyles from backend ────────────────────────────
  useEffect(() => {
    fetchDashboardCategories()
      .then(setCategories)
      .catch(() => {/* auth redirect will handle this */});
    fetchDashboardHairStyles()
      .then(setHairstyles)
      .catch(() => {});
  }, []);

  // Revoke preview object URLs on unmount
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Category add ─────────────────────────────────────────────────────────
  const handleCategorySelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === ADD_NEW_VALUE) {
      setShowAddCategory(true);
    } else {
      setCategoryId(event.target.value);
      setShowAddCategory(false);
    }
  };

  const handleAddCategory = useCallback(async (newName: string) => {
    setAddingCategory(true);
    try {
      const created = await createDashboardCategory(newName);
      setCategories((prev) => [...prev, created]);
      setCategoryId(String(created.id));
      setShowAddCategory(false);
    } finally {
      setAddingCategory(false);
    }
  }, []);

  // ── Hairstyle add ─────────────────────────────────────────────────────────
  const handleHairstyleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value === ADD_NEW_VALUE) {
      setShowAddHairstyle(true);
    } else {
      setHairstyleId(event.target.value);
      setShowAddHairstyle(false);
    }
  };

  const handleAddHairstyle = useCallback(async (newName: string) => {
    setAddingHairstyle(true);
    try {
      const created = await createDashboardHairStyle(newName);
      setHairstyles((prev) => [...prev, created]);
      setHairstyleId(String(created.id));
      setShowAddHairstyle(false);
    } finally {
      setAddingHairstyle(false);
    }
  }, []);

  // ── Image handling ────────────────────────────────────────────────────────
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...next]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep = (target: Step) => {
    const next: Record<string, string> = {};
    if (target === 'Basic Info') {
      if (!name.trim()) next.name = 'Enter a product name.';
      if (!categoryId) next.category = 'Select a category.';
    }
    if (target === 'Images' && images.length === 0) {
      next.images = 'Add at least one product photo.';
    }
    if (target === 'Pricing & Stock') {
      if (!price || Number(price) <= 0) next.price = 'Enter a selling price.';
      if (stock === '' || Number(stock) < 0) next.stock = 'Enter the stock quantity.';
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
    if (index <= stepIndex) {
      setStepIndex(index);
    } else if (validateStep(step)) {
      setStepIndex(index);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateStep('Pricing & Stock')) {
      setStepIndex(2);
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create the product record
      const product = await createDashboardProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        category: Number(categoryId),
        hairstyle: hairstyleId ? Number(hairstyleId) : null,
        price: Number(price).toFixed(2),
        previous_price: compareAtPrice ? Number(compareAtPrice).toFixed(2) : null,
        stock_quantity: Number(stock),
        is_featured: featured,
        is_active: true,
      });

      // 2. Upload each image to Cloudinary then register with the backend
      await Promise.all(
        images.map(async (img, index) => {
          try {
            const uploaded = await uploadImageToCloudinary(img.file);
            await createDashboardProductImage({
              product: product.id,
              image_url: uploaded.secureUrl,
              public_id: uploaded.publicId,
              width: uploaded.width ?? null,
              height: uploaded.height ?? null,
              format: uploaded.format ?? '',
              sort_order: index,
              is_primary: index === 0,
            });
          } catch {
            // Non-fatal — product is created; user can add images later
          }
        })
      );

      pushToast({
        title: 'Product created.',
        body: `${name} was added to your catalogue.`,
        tone: 'success',
      });
      router.push('/admin/products');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      pushToast({ title: 'Failed to create product.', body: message, tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const previewPrice = Number(price) || 0;
  const previewCompareAt = Number(compareAtPrice) || 0;
  const selectedCategory = categories.find((c) => String(c.id) === categoryId);
  const selectedHairstyle = hairstyles.find((h) => String(h.id) === hairstyleId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="label-luxe text-chestnut">Products</p>
          <h1 className="mt-1 font-serif text-2xl text-ink sm:text-3xl">Add New Product</h1>
        </div>
        <p className="text-xs text-ink/45">
          Step {stepIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Step indicators */}
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
                active
                  ? 'border-chestnut text-chestnut'
                  : 'border-transparent text-ink/45 hover:text-ink/70'
              )}
            >
              <span
                className={cx(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                  done
                    ? 'bg-chestnut text-white'
                    : active
                      ? 'border border-chestnut text-chestnut'
                      : 'border border-ink/25'
                )}
              >
                {done ? <CheckIcon width={11} height={11} /> : index + 1}
              </span>
              {label}
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="border border-ink/10 bg-white p-5 sm:p-6">

        {/* ── STEP 1: Basic Info ─────────────────────────────────────────── */}
        {step === 'Basic Info' && (
          <div className="max-w-2xl space-y-5">
            <h2 className="font-serif text-lg text-ink">Basic Information</h2>

            {/* Name */}
            <div>
              <label className={labelClass} htmlFor="product-name">Product Name</label>
              <input
                id="product-name"
                className={inputClass}
                placeholder="e.g. Luxury Body Wave"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="mt-1.5 text-xs text-red-700">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass} htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                rows={5}
                className={cx(inputClass, 'resize-y')}
                placeholder="Describe the piece — texture, finish, what makes it stand out."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className={labelClass} htmlFor="product-category">Category</label>
                <select
                  id="product-category"
                  className={inputClass}
                  value={showAddCategory ? ADD_NEW_VALUE : categoryId}
                  onChange={handleCategorySelectChange}
                  disabled={addingCategory}
                >
                  <option value="">— Select a category —</option>
                  <option value={ADD_NEW_VALUE} className="font-semibold text-chestnut">
                    + Add missing category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {showAddCategory && (
                  <InlineAddPanel
                    label="Category"
                    placeholder="e.g. Lace Front, Bob, Braids…"
                    isCreating={addingCategory}
                    onConfirm={handleAddCategory}
                    onCancel={() => {
                      setShowAddCategory(false);
                      setCategoryId('');
                    }}
                  />
                )}
                {errors.category && (
                  <p className="mt-1.5 text-xs text-red-700">{errors.category}</p>
                )}
              </div>

              {/* Hairstyle */}
              <div>
                <label className={labelClass} htmlFor="product-hairstyle">Hairstyle</label>
                <select
                  id="product-hairstyle"
                  className={inputClass}
                  value={showAddHairstyle ? ADD_NEW_VALUE : hairstyleId}
                  onChange={handleHairstyleSelectChange}
                  disabled={addingHairstyle}
                >
                  <option value="">— Select a hairstyle —</option>
                  <option value={ADD_NEW_VALUE} className="font-semibold text-chestnut">
                    + Add missing hairstyle
                  </option>
                  {hairstyles.map((hs) => (
                    <option key={hs.id} value={String(hs.id)}>
                      {hs.name}
                    </option>
                  ))}
                </select>
                {showAddHairstyle && (
                  <InlineAddPanel
                    label="Hairstyle"
                    placeholder="e.g. Straight, Body Wave, Curly…"
                    isCreating={addingHairstyle}
                    onConfirm={handleAddHairstyle}
                    onCancel={() => {
                      setShowAddHairstyle(false);
                      setHairstyleId('');
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Images ────────────────────────────────────────────── */}
        {step === 'Images' && (
          <div className="max-w-2xl space-y-4">
            <h2 className="font-serif text-lg text-ink">Product Images</h2>
            <label
              htmlFor="product-images"
              className="flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-ink/25 bg-cream/40 px-6 py-10 text-center transition-colors duration-200 hover:border-chestnut"
            >
              <UploadIcon width={22} height={22} className="text-ink/40" />
              <span className="text-sm text-chestnut underline underline-offset-4">Choose files</span>
              <span className="text-xs text-ink/45">
                Upload product photos. Recommended: 1200×1200 px
              </span>
              <input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            {errors.images && <p className="text-xs text-red-700">{errors.images}</p>}

            {images.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {images.map((image, index) => (
                    <div
                      key={image.url}
                      className="group relative aspect-square overflow-hidden border border-ink/10"
                    >
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
                  {images.length} file{images.length === 1 ? '' : 's'} selected — first image is
                  the primary display image.
                </p>
              </>
            )}
          </div>
        )}

        {/* ── STEP 3: Pricing & Stock ───────────────────────────────────── */}
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
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  {errors.price && (
                    <p className="mt-1.5 text-xs text-red-700">{errors.price}</p>
                  )}
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
                    onChange={(e) => setCompareAtPrice(e.target.value)}
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
                onChange={(e) => setStock(e.target.value)}
              />
              {errors.stock && (
                <p className="mt-1.5 text-xs text-red-700">{errors.stock}</p>
              )}
            </div>

            <label className="flex items-center justify-between border border-ink/10 bg-cream/40 px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-ink">Featured Product</span>
                <span className="block text-xs text-ink/50">Show on your shop homepage</span>
              </span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-5 w-5 accent-chestnut"
              />
            </label>
          </div>
        )}

        {/* ── STEP 4: Preview ───────────────────────────────────────────── */}
        {step === 'Preview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
            <div className="space-y-3 text-sm text-ink/70">
              <h2 className="font-serif text-lg text-ink">Review before publishing</h2>
              <dl className="space-y-2">
                {[
                  ['Name', name || '—'],
                  ['Category', selectedCategory?.name || '—'],
                  ['Hairstyle', selectedHairstyle?.name || '—'],
                  ['Price', formatKsh(previewPrice)],
                  ['Stock', `${stock || '0'} units`],
                  ['Featured', featured ? 'Yes' : 'No'],
                ].map(([dt, dd]) => (
                  <div key={dt} className="flex gap-2">
                    <dt className="w-32 shrink-0 text-ink/45">{dt}</dt>
                    <dd>{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="border border-ink/10 bg-white">
              <div className="relative aspect-square bg-cream">
                {images[0] ? (
                  <img
                    src={images[0].url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
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
                <p className="line-clamp-2 text-sm font-medium text-ink">
                  {name || 'Product Name'}
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  {previewCompareAt > 0 && (
                    <span className="text-xs text-ink/40 line-through">
                      {formatKsh(previewCompareAt)}
                    </span>
                  )}
                  <span className="text-sm font-semibold text-chestnut">
                    {formatKsh(previewPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
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
