'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  CheckIcon,
  ImageIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  SparklesIcon,
  LayersIcon,
} from 'lucide-react';
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

interface ImagePreview {
  file: File;
  url: string;
}

interface SizeVariantInput {
  id: string;
  name: string;
  price: string;
  previous_price?: string;
  stock_quantity: string;
  image_index?: number | null;
  is_active?: boolean;
}

interface ColorVariantInput {
  id: string;
  name: string;
  hex_code: string;
  image_index?: number | null;
  stock_quantity: string;
  price: string;
  is_active?: boolean;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700';

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
  const [stock, setStock] = useState('0');
  const [featured, setFeatured] = useState(false);

  // ── Manage Variants (Optional expandable) ────────────────────────────────
  const [showVariants, setShowVariants] = useState(false);
  const [sizes, setSizes] = useState<SizeVariantInput[]>([]);
  const [colors, setColors] = useState<ColorVariantInput[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load categories & hairstyles from backend ────────────────────────────
  useEffect(() => {
    fetchDashboardCategories()
      .then(setCategories)
      .catch(() => {});
    fetchDashboardHairStyles()
      .then(setHairstyles)
      .catch(() => {});
  }, []);

  // Revoke preview object URLs on unmount
  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.url));
  }, [images]);

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

  // ── Variant row handlers ─────────────────────────────────────────────────
  const handleAddSizeRow = () => {
    setShowVariants(true);
    setSizes((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        price: price || '',
        previous_price: compareAtPrice || '',
        stock_quantity: '10',
        image_index: null,
        is_active: true,
      },
    ]);
  };

  const handleUpdateSize = <K extends keyof SizeVariantInput>(
    id: string,
    field: K,
    val: SizeVariantInput[K]
  ) => {
    setSizes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveSize = (id: string) => {
    setSizes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddColorRow = () => {
    setShowVariants(true);
    setColors((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        hex_code: '#000000',
        image_index: null,
        stock_quantity: '10',
        price: '',
        is_active: true,
      },
    ]);
  };

  const handleUpdateColor = <K extends keyof ColorVariantInput>(
    id: string,
    field: K,
    val: ColorVariantInput[K]
  ) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleRemoveColor = (id: string) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
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
      if (!price || Number(price) <= 0) next.price = 'Enter a valid selling price.';
      if (stock === '' || Number(stock) < 0) next.stock = 'Enter a stock quantity.';
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
      // 1. Upload each image to Cloudinary first so color variants can attach to their real URLs
      const uploadedImages = await Promise.all(
        images.map(async (img, index) => {
          try {
            const uploaded = await uploadImageToCloudinary(img.file);
            return {
              index,
              secureUrl: uploaded.secureUrl,
              publicId: uploaded.publicId,
              width: uploaded.width ?? null,
              height: uploaded.height ?? null,
              format: uploaded.format ?? '',
            };
          } catch {
            return null;
          }
        })
      );

      // Filter out any blank or incomplete variant rows so users aren't penalised
      const validColors = colors
        .filter((c) => c.name.trim().length > 0)
        .map((c, index) => ({
          name: c.name.trim(),
          hex_code: c.hex_code || '#000000',
          image_url:
            c.image_index != null && uploadedImages[c.image_index]
              ? uploadedImages[c.image_index]!.secureUrl
              : null,
          stock_quantity: Number(c.stock_quantity) || 0,
          price: c.price ? Number(c.price).toFixed(2) : null,
          sort_order: index,
          is_active: c.is_active ?? true,
        }));

      const validSizes = sizes
        .filter((s) => s.name.trim().length > 0)
        .map((s, index) => ({
          name: s.name.trim(),
          stock_quantity: Number(s.stock_quantity) || 0,
          price: s.price ? Number(s.price).toFixed(2) : null,
          sort_order: index,
          is_active: s.is_active ?? true,
        }));

      // 2. Create the product record with optional variants
      const product = await createDashboardProduct({
        name: name.trim(),
        description: description.trim() || undefined,
        category: Number(categoryId),
        hairstyle: hairstyleId ? Number(hairstyleId) : null,
        price: Number(price).toFixed(2),
        previous_price: compareAtPrice ? Number(compareAtPrice).toFixed(2) : null,
        stock_quantity: Number(stock) || 0,
        is_featured: featured,
        is_active: true,
        colors: validColors.length > 0 ? validColors : undefined,
        sizes: validSizes.length > 0 ? validSizes : undefined,
      });

      // 3. Register each uploaded image with backend
      await Promise.all(
        uploadedImages.map(async (uploaded, index) => {
          if (!uploaded) return;
          try {
            await createDashboardProductImage({
              product: product.id,
              image_url: uploaded.secureUrl,
              public_id: uploaded.publicId,
              width: uploaded.width,
              height: uploaded.height,
              format: uploaded.format,
              sort_order: index,
              is_primary: index === 0,
            });
          } catch {
            // Non-fatal — product is created; user can manage images later
          }
        })
      );

      toast.success('Product created successfully.', {
        description: `${name} was added to your catalogue.`,
      });
      router.push('/admin/products');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast.error('Failed to create product.', {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const previewPrice = Number(price) || 0;
  const previewCompareAt = Number(compareAtPrice) || 0;
  const selectedCategory = categories.find((c) => String(c.id) === categoryId);
  const selectedHairstyle = hairstyles.find((h) => String(h.id) === hairstyleId);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Catalogue</span>
            <span>/</span>
            <span className="text-orange-600 font-semibold">New Product</span>
          </div>
          <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl">
            Add New Product
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Publish a luxury hairpiece with optional size and colour variants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Step {stepIndex + 1} of {steps.length}
          </span>
        </div>
      </div>

      {/* Modern Stepper Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs">
        {steps.map((label, index) => {
          const active = index === stepIndex;
          const done = index < stepIndex;
          return (
            <button
              key={label}
              type="button"
              onClick={() => goToStep(index)}
              className={cx(
                'flex flex-1 shrink-0 items-center justify-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200',
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : done
                    ? 'bg-slate-100/80 text-slate-800 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              )}
            >
              <span
                className={cx(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition-all',
                  done
                    ? 'bg-emerald-600 text-white'
                    : active
                      ? 'bg-white text-slate-900'
                      : 'border border-slate-300 text-slate-400'
                )}
              >
                {done ? <CheckIcon width={12} height={12} strokeWidth={3} /> : index + 1}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Body */}
      <div className="space-y-6">

        {/* ── STEP 1: Basic Info ─────────────────────────────────────────── */}
        {step === 'Basic Info' && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-serif text-xl font-normal text-slate-900">Basic Information</h2>
              <p className="mt-1 text-xs text-slate-500">
                Core descriptive details for this piece in the catalogue.
              </p>
            </div>

            {/* Product Name */}
            <div>
              <label className={labelClass} htmlFor="product-name">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                className={inputClass}
                placeholder="e.g. Luxury Body Wave Lace Frontal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass} htmlFor="product-description">
                Description
              </label>
              <textarea
                id="product-description"
                rows={5}
                className={cx(inputClass, 'resize-y leading-relaxed')}
                placeholder="Describe the texture, density, cap fit, and what makes this luxury piece exceptional."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className={labelClass} htmlFor="product-category">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="product-category"
                  className={inputClass}
                  value={showAddCategory ? ADD_NEW_VALUE : categoryId}
                  onChange={handleCategorySelectChange}
                  disabled={addingCategory}
                >
                  <option value="">— Select a category —</option>
                  <option value={ADD_NEW_VALUE} className="font-semibold text-orange-600">
                    + Add missing category…
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {showAddCategory && (
                  <div className="mt-3">
                    <InlineAddPanel
                      label="Category"
                      placeholder="e.g. HD Frontal Wigs, Bob Wigs…"
                      isCreating={addingCategory}
                      onConfirm={handleAddCategory}
                      onCancel={() => {
                        setShowAddCategory(false);
                        setCategoryId('');
                      }}
                    />
                  </div>
                )}
                {errors.category && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Hairstyle */}
              <div>
                <label className={labelClass} htmlFor="product-hairstyle">
                  Hairstyle / Texture
                </label>
                <select
                  id="product-hairstyle"
                  className={inputClass}
                  value={showAddHairstyle ? ADD_NEW_VALUE : hairstyleId}
                  onChange={handleHairstyleSelectChange}
                  disabled={addingHairstyle}
                >
                  <option value="">— Select a texture —</option>
                  <option value={ADD_NEW_VALUE} className="font-semibold text-orange-600">
                    + Add missing texture…
                  </option>
                  {hairstyles.map((hs) => (
                    <option key={hs.id} value={String(hs.id)}>
                      {hs.name}
                    </option>
                  ))}
                </select>
                {showAddHairstyle && (
                  <div className="mt-3">
                    <InlineAddPanel
                      label="Hairstyle"
                      placeholder="e.g. Bone Straight, Kinky Curly…"
                      isCreating={addingHairstyle}
                      onConfirm={handleAddHairstyle}
                      onCancel={() => {
                        setShowAddHairstyle(false);
                        setHairstyleId('');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Images ────────────────────────────────────────────── */}
        {step === 'Images' && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-serif text-xl font-normal text-slate-900">Product Images</h2>
              <p className="mt-1 text-xs text-slate-500">
                Upload clear high-definition photos. The first image will be the primary cover image.
              </p>
            </div>

            <label
              htmlFor="product-images"
              className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center transition-all duration-200 hover:border-slate-800 hover:bg-slate-100/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200">
                <UploadIcon width={22} height={22} className="text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Click or drag images here to upload
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Supports JPG, PNG, WEBP. High resolution (1200×1200) recommended.
                </p>
              </div>
              <input
                id="product-images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
            {errors.images && <p className="text-xs font-medium text-red-600">{errors.images}</p>}

            {images.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Selected Photos ({images.length})
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  {images.map((image, index) => (
                    <div
                      key={image.url}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-2xs"
                    >
                      <img src={image.url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-xs text-red-600 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-50"
                        aria-label="Remove image"
                      >
                        <Trash2Icon width={13} height={13} />
                      </button>
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Pricing & Stock (with expandable Manage Variants) ─── */}
        {step === 'Pricing & Stock' && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-normal text-slate-900">Pricing &amp; Stock</h2>

            {/* Card 1: Price, Attributes & Stock */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Price, Attributes &amp; Stock
              </h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="product-price">
                    Selling Price (KES) <span className="text-red-500">*</span>
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
                    <p className="mt-1.5 text-xs font-medium text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor="product-compare-price">
                    Price Before Discount (KES) (optional)
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

            {/* Card 2: Inventory */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Inventory</h3>
              <div>
                <label className={labelClass} htmlFor="product-stock">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min={0}
                  className={cx(inputClass, 'max-w-md')}
                  placeholder="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
                {errors.stock && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">{errors.stock}</p>
                )}
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:bg-slate-100/60">
                <div>
                  <span className="block text-sm font-semibold text-slate-800">Featured Piece</span>
                  <span className="block text-xs text-slate-500">Showcase this item on the boutique homepage</span>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-5 w-5 rounded accent-orange-600"
                />
              </label>
            </div>

            {/* Manage Variants Toggle (Optional) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowVariants(!showVariants)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <span className="text-base font-bold leading-none">{showVariants ? '—' : '+'}</span>
                <span>Manage Variants (Optional)</span>
              </button>

              {showVariants && (
                <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleAddSizeRow}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-amber-50/80 px-4 py-2.5 text-xs font-semibold text-amber-900 transition-all hover:bg-amber-100 active:scale-95"
                    >
                      <PlusIcon width={14} height={14} className="text-amber-700" />
                      Add Size
                    </button>
                    <button
                      type="button"
                      onClick={handleAddColorRow}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50/80 px-4 py-2.5 text-xs font-semibold text-emerald-900 transition-all hover:bg-emerald-100 active:scale-95"
                    >
                      <PlusIcon width={14} height={14} className="text-emerald-700" />
                      Add Color
                    </button>
                  </div>

                  {/* ── Sizes Section ──────────────────────────────────── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Sizes
                      </h4>
                      <span className="text-xs text-slate-400">
                        {sizes.length} {sizes.length === 1 ? 'size' : 'sizes'}
                      </span>
                    </div>

                    {sizes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
                        No size variants configured yet. Click{' '}
                        <strong className="text-slate-600">+ Add Size</strong> above to define
                        custom lengths or sizes.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Size *</th>
                              <th className="px-4 py-3">Selling Price (KES) *</th>
                              <th className="px-4 py-3">Price Before Discount (KES)</th>
                              <th className="px-4 py-3">Stock *</th>
                              <th className="px-4 py-3">Image</th>
                              <th className="px-3 py-3 text-center">Active</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sizes.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50/50">
                                <td className="p-3">
                                  <input
                                    type="text"
                                    placeholder="e.g. 18 inch"
                                    value={s.name}
                                    onChange={(e) => handleUpdateSize(s.id, 'name', e.target.value)}
                                    className="w-28 sm:w-36 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder={price || '0.00'}
                                    value={s.price}
                                    onChange={(e) => handleUpdateSize(s.id, 'price', e.target.value)}
                                    className="w-24 sm:w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder={compareAtPrice || '0.00'}
                                    value={s.previous_price || ''}
                                    onChange={(e) =>
                                      handleUpdateSize(s.id, 'previous_price', e.target.value)
                                    }
                                    className="w-24 sm:w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="10"
                                    value={s.stock_quantity}
                                    onChange={(e) =>
                                      handleUpdateSize(s.id, 'stock_quantity', e.target.value)
                                    }
                                    className="w-16 sm:w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  {images.length > 0 ? (
                                    <select
                                      value={s.image_index != null ? String(s.image_index) : ''}
                                      onChange={(e) =>
                                        handleUpdateSize(
                                          s.id,
                                          'image_index',
                                          e.target.value === '' ? null : Number(e.target.value)
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                    >
                                      <option value="">Default</option>
                                      {images.map((img, i) => (
                                        <option key={img.url} value={i}>
                                          Photo #{i + 1}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">None</span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={s.is_active ?? true}
                                    onChange={(e) =>
                                      handleUpdateSize(s.id, 'is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded accent-orange-600"
                                  />
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSize(s.id)}
                                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                                    aria-label="Remove size row"
                                  >
                                    <Trash2Icon width={14} height={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* ── Colors Section ─────────────────────────────────── */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Colors
                      </h4>
                      <span className="text-xs text-slate-400">
                        {colors.length} {colors.length === 1 ? 'color' : 'colors'}
                      </span>
                    </div>

                    {colors.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-400">
                        No color variants configured yet. Click{' '}
                        <strong className="text-slate-600">+ Add Color</strong> above to link
                        custom shades with photos.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Color *</th>
                              <th className="px-4 py-3">Swatch Hex</th>
                              <th className="px-4 py-3">Image *</th>
                              <th className="px-4 py-3">Stock *</th>
                              <th className="px-4 py-3">Price (KES)</th>
                              <th className="px-3 py-3 text-center">Active</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {colors.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-50/50">
                                <td className="p-3">
                                  <input
                                    type="text"
                                    placeholder="e.g. Natural Black"
                                    value={c.name}
                                    onChange={(e) => handleUpdateColor(c.id, 'name', e.target.value)}
                                    className="w-28 sm:w-36 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="color"
                                      value={c.hex_code}
                                      onChange={(e) =>
                                        handleUpdateColor(c.id, 'hex_code', e.target.value)
                                      }
                                      className="h-7 w-7 cursor-pointer rounded-md border-0 bg-transparent p-0"
                                    />
                                    <span className="text-[11px] font-mono text-slate-500 uppercase">
                                      {c.hex_code}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {images.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={c.image_index != null ? String(c.image_index) : ''}
                                        onChange={(e) =>
                                          handleUpdateColor(
                                            c.id,
                                            'image_index',
                                            e.target.value === '' ? null : Number(e.target.value)
                                          )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                      >
                                        <option value="">No linked photo</option>
                                        {images.map((img, i) => (
                                          <option key={img.url} value={i}>
                                            Photo #{i + 1}
                                          </option>
                                        ))}
                                      </select>
                                      {c.image_index != null && images[c.image_index] && (
                                        <img
                                          src={images[c.image_index].url}
                                          alt=""
                                          className="h-6 w-6 rounded-md object-cover border border-slate-200"
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">None uploaded</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="10"
                                    value={c.stock_quantity}
                                    onChange={(e) =>
                                      handleUpdateColor(c.id, 'stock_quantity', e.target.value)
                                    }
                                    className="w-16 sm:w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Default"
                                    value={c.price}
                                    onChange={(e) => handleUpdateColor(c.id, 'price', e.target.value)}
                                    className="w-20 sm:w-24 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={c.is_active ?? true}
                                    onChange={(e) =>
                                      handleUpdateColor(c.id, 'is_active', e.target.checked)
                                    }
                                    className="h-4 w-4 rounded accent-orange-600"
                                  />
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColor(c.id)}
                                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                                    aria-label="Remove color row"
                                  >
                                    <Trash2Icon width={14} height={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 pt-2">
                    * Required field for active variants
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 4: Preview ───────────────────────────────────────────── */}
        {step === 'Preview' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-serif text-xl font-normal text-slate-900">
                  Review Before Publishing
                </h2>
                <p className="text-xs text-slate-500">
                  Check all specifications before saving to your live store catalogue.
                </p>
              </div>

              <dl className="divide-y divide-slate-100 text-xs">
                {[
                  ['Product Name', name || '—'],
                  ['Category', selectedCategory?.name || '—'],
                  ['Texture / Style', selectedHairstyle?.name || '—'],
                  ['Selling Price', formatKsh(previewPrice)],
                  [
                    'Price Before Discount',
                    previewCompareAt > 0 ? formatKsh(previewCompareAt) : 'None',
                  ],
                  ['Stock Quantity', `${stock || '0'} units`],
                  ['Homepage Featured', featured ? 'Yes' : 'No'],
                  [
                    'Sizes Configured',
                    sizes.filter((s) => s.name.trim()).length > 0
                      ? sizes
                          .filter((s) => s.name.trim())
                          .map((s) => s.name)
                          .join(', ')
                      : 'None (Standard)',
                  ],
                  [
                    'Colors Configured',
                    colors.filter((c) => c.name.trim()).length > 0
                      ? colors
                          .filter((c) => c.name.trim())
                          .map((c) => c.name)
                          .join(', ')
                      : 'None (Standard)',
                  ],
                ].map(([dt, dd]) => (
                  <div key={dt} className="flex justify-between py-3">
                    <dt className="text-slate-500 font-medium">{dt}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{dd}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Live Storefront Card Mockup */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Card Preview
              </p>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
                <div className="relative aspect-square bg-slate-100">
                  {images[0] ? (
                    <img
                      src={images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon width={36} height={36} />
                    </div>
                  )}
                  {featured && (
                    <span className="absolute top-3 left-3 rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    {selectedCategory?.name || 'Category'}
                  </p>
                  <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                    {name || 'Product Title'}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {formatKsh(previewPrice)}
                    </span>
                    {previewCompareAt > 0 && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatKsh(previewCompareAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons (Matching Screenshots Layout) */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goPrevious}
            disabled={stepIndex === 0}
            className="rounded-xl border border-slate-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 shadow-2xs transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        <div>
          {step === 'Preview' ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-orange-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating Product…' : 'Publish Product'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-orange-700 active:scale-95"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
