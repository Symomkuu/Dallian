'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { cx, formatKsh } from '@/utils/format';
import InlineAddPanel from '@/components/admin/InlineAddPanel';
import { uploadImageToCloudinary } from '@/utils/cloudinary';
import {
  cleanImageUrl,
  createDashboardCategory,
  createDashboardHairStyle,
  createDashboardProductImage,
  deleteDashboardProductImage,
  fetchDashboardCategories,
  fetchDashboardHairStyles,
  fetchDashboardProduct,
  setPrimaryDashboardProductImage,
  updateDashboardProduct,
  type DashboardCategory,
  type DashboardHairStyle,
} from '@/utils/api';

const steps = ['Basic Info', 'Images', 'Pricing & Stock', 'Preview'] as const;
type Step = (typeof steps)[number];

const ADD_NEW_VALUE = '__add_new__';

interface ExistingImage {
  id: number;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

interface NewImagePreview {
  file: File;
  url: string;
}

interface SizeVariantInput {
  id: string;
  name: string;
  price: string;
  previous_price?: string;
  stock_quantity: string;
  image_ref?: string | null;
  is_active?: boolean;
}

interface ColorVariantInput {
  id: string;
  name: string;
  hex_code: string;
  image_ref?: string | null;
  stock_quantity: string;
  price: string;
  is_active?: boolean;
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-slate-800 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5';
const labelClass = 'mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id ? String(params.id) : '';

  const { pushToast } = useStore();
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = steps[stepIndex];

  const [loadingProduct, setLoadingProduct] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ── Basic Info ──────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');

  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const [hairstyles, setHairstyles] = useState<DashboardHairStyle[]>([]);
  const [hairstyleId, setHairstyleId] = useState('');
  const [showAddHairstyle, setShowAddHairstyle] = useState(false);
  const [addingHairstyle, setAddingHairstyle] = useState(false);

  // ── Images ───────────────────────────────────────────────────────────────
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<NewImagePreview[]>([]);
  const [primaryImageRef, setPrimaryImageRef] = useState<string>('');

  // ── Pricing & Stock ──────────────────────────────────────────────────────
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // ── Manage Variants (Optional expandable) ────────────────────────────────
  const [showVariants, setShowVariants] = useState(false);
  const [sizes, setSizes] = useState<SizeVariantInput[]>([]);
  const [colors, setColors] = useState<ColorVariantInput[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Load Categories and Hairstyles ───────────────────────────────────────
  useEffect(() => {
    fetchDashboardCategories()
      .then(setCategories)
      .catch(() => {});
    fetchDashboardHairStyles()
      .then(setHairstyles)
      .catch(() => {});
  }, []);

  // ── Load Product Data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    fetchDashboardProduct(productId)
      .then((product) => {
        setName(product.name || '');
        setDescription(product.description || '');
        setSku(product.sku || '');
        setCategoryId(product.category ? String(product.category) : '');
        setHairstyleId(product.hairstyle ? String(product.hairstyle) : '');
        setPrice(product.price || '');
        setCompareAtPrice(product.previous_price || '');
        setStock(String(product.stock_quantity ?? 0));
        setFeatured(Boolean(product.is_featured));
        setIsActive(Boolean(product.is_active));

        // Format existing images
        const imgs: ExistingImage[] = (product.images || []).map((img, idx) => ({
          id: img.id,
          url: cleanImageUrl(img.image_url),
          is_primary: Boolean(img.is_primary),
          sort_order: img.sort_order ?? idx,
        }));
        setExistingImages(imgs);

        const primary = imgs.find((img) => img.is_primary) ?? imgs[0];
        if (primary) {
          setPrimaryImageRef(`existing-${primary.id}`);
        }

        // Format sizes
        if (product.sizes && product.sizes.length > 0) {
          setShowVariants(true);
          setSizes(
            product.sizes.map((s) => ({
              id: String(s.id),
              name: s.name,
              price: s.price ? String(s.price) : '',
              previous_price: '',
              stock_quantity: String(s.stock_quantity ?? 0),
              is_active: s.is_active,
            }))
          );
        }

        // Format colors
        if (product.colors && product.colors.length > 0) {
          setShowVariants(true);
          setColors(
            product.colors.map((c) => {
              let ref = '';
              if (c.image) {
                ref = `existing-${c.image}`;
              } else if (c.image_url) {
                const cleaned = cleanImageUrl(c.image_url);
                const match = imgs.find((img) => img.url === cleaned);
                if (match) ref = `existing-${match.id}`;
              }
              return {
                id: String(c.id),
                name: c.name,
                hex_code: c.hex_code || '#000000',
                image_ref: ref || null,
                stock_quantity: String(c.stock_quantity ?? 0),
                price: c.price ? String(c.price) : '',
                is_active: c.is_active,
              };
            })
          );
        }
      })
      .catch(() => {
        pushToast({
          title: 'Product not found',
          body: 'Could not load product details.',
          tone: 'error',
        });
        router.push('/admin/products');
      })
      .finally(() => setLoadingProduct(false));
  }, [productId, pushToast, router]);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => newImages.forEach((img) => URL.revokeObjectURL(img.url));
  }, [newImages]);

  // Combined photo list for variant dropdowns and preview
  const allActiveImages = [
    ...existingImages
      .filter((img) => !removedImageIds.includes(img.id))
      .map((img) => ({
        ref: `existing-${img.id}`,
        id: img.id,
        url: img.url,
        isNew: false as const,
        newIndex: null as number | null,
      })),
    ...newImages.map((img, idx) => ({
      ref: `new-${idx}`,
      id: null as number | null,
      url: img.url,
      isNew: true as const,
      file: img.file,
      newIndex: idx as number | null,
    })),
  ];

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

  // ── Image Handling ────────────────────────────────────────────────────────
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...next]);
  };

  const handleRemoveExistingImage = (id: number) => {
    setRemovedImageIds((prev) => [...prev, id]);
    if (primaryImageRef === `existing-${id}`) {
      const remaining = allActiveImages.filter((img) => img.ref !== `existing-${id}`);
      setPrimaryImageRef(remaining.length > 0 ? remaining[0].ref : '');
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    if (primaryImageRef === `new-${index}`) {
      const remaining = allActiveImages.filter((img) => img.ref !== `new-${index}`);
      setPrimaryImageRef(remaining.length > 0 ? remaining[0].ref : '');
    }
  };

  const handleSetPrimary = (ref: string) => {
    setPrimaryImageRef(ref);
  };

  // ── Variant Row Handlers ─────────────────────────────────────────────────
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
        image_ref: null,
        is_active: true,
      },
    ]);
  };

  const handleUpdateSize = <K extends keyof SizeVariantInput>(
    id: string,
    field: K,
    val: SizeVariantInput[K]
  ) => {
    setSizes((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
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
        image_ref: allActiveImages.length > 0 ? allActiveImages[0].ref : null,
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
    setColors((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
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
    if (target === 'Images' && allActiveImages.length === 0) {
      next.images = 'Keep at least one product photo.';
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

  // ── Save Changes ─────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!validateStep('Pricing & Stock')) {
      setStepIndex(2);
      return;
    }
    setSubmitting(true);
    try {
      // 1. Delete any existing images marked for removal
      await Promise.all(
        removedImageIds.map(async (imgId) => {
          try {
            await deleteDashboardProductImage(imgId);
          } catch {
            // Non-fatal
          }
        })
      );

      // 2. Upload any new images to Cloudinary and register with backend
      const uploadedMap = new Map<string, { id: number; url: string }>();

      for (let i = 0; i < newImages.length; i++) {
        const item = newImages[i];
        try {
          const uploaded = await uploadImageToCloudinary(item.file);
          const isPrimary = primaryImageRef === `new-${i}`;
          const createdImg = await createDashboardProductImage({
            product: Number(productId),
            image_url: uploaded.secureUrl,
            public_id: uploaded.publicId,
            width: uploaded.width,
            height: uploaded.height,
            format: uploaded.format,
            sort_order: 10 + i,
            is_primary: isPrimary,
          });
          uploadedMap.set(`new-${i}`, { id: createdImg.id, url: createdImg.image_url });
        } catch {
          // If upload fails, proceed with others
        }
      }

      // 3. If an existing image was chosen as primary, make sure it is set as primary
      if (primaryImageRef.startsWith('existing-')) {
        const existingId = Number(primaryImageRef.replace('existing-', ''));
        try {
          await setPrimaryDashboardProductImage(existingId);
        } catch {
          // Ignore if already primary
        }
      }

      // 4. Resolve image references for color variants
      const validColors = colors
        .filter((c) => c.name.trim().length > 0)
        .map((c, index) => {
          let imageId: number | null = null;
          let imageUrl: string | null = null;

          if (c.image_ref) {
            if (c.image_ref.startsWith('existing-')) {
              const id = Number(c.image_ref.replace('existing-', ''));
              imageId = id;
              const found = existingImages.find((img) => img.id === id);
              if (found) imageUrl = found.url;
            } else if (uploadedMap.has(c.image_ref)) {
              const uploaded = uploadedMap.get(c.image_ref)!;
              imageId = uploaded.id;
              imageUrl = uploaded.url;
            }
          }

          return {
            name: c.name.trim(),
            hex_code: c.hex_code || '#000000',
            image: imageId,
            image_url: imageUrl,
            stock_quantity: Number(c.stock_quantity) || 0,
            price: c.price ? Number(c.price).toFixed(2) : null,
            sort_order: index,
            is_active: c.is_active ?? true,
          };
        });

      const validSizes = sizes
        .filter((s) => s.name.trim().length > 0)
        .map((s, index) => ({
          name: s.name.trim(),
          stock_quantity: Number(s.stock_quantity) || 0,
          price: s.price ? Number(s.price).toFixed(2) : null,
          sort_order: index,
          is_active: s.is_active ?? true,
        }));

      // 5. Update product in backend
      await updateDashboardProduct(productId, {
        name: name.trim(),
        description: description.trim() || undefined,
        category: Number(categoryId),
        hairstyle: hairstyleId ? Number(hairstyleId) : null,
        sku: sku.trim() || undefined,
        price: Number(price).toFixed(2),
        previous_price: compareAtPrice ? Number(compareAtPrice).toFixed(2) : null,
        stock_quantity: Number(stock) || 0,
        is_featured: featured,
        is_active: isActive,
        colors: validColors,
        sizes: validSizes,
      });

      pushToast({
        title: 'Product updated successfully.',
        body: `${name} has been updated in the catalogue.`,
        tone: 'success',
      });
      router.push('/admin/products');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while saving changes.';
      pushToast({ title: 'Failed to update product', body: message, tone: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Primary preview image
  const primaryDisplayImage =
    allActiveImages.find((img) => img.ref === primaryImageRef)?.url ||
    allActiveImages[0]?.url ||
    '';

  if (loadingProduct) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Loading product details…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <Link
            href="/admin/products"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeftIcon width={14} height={14} />
            Back to Products
          </Link>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Edit Product
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Updating piece: <span className="font-semibold text-slate-800">{name || 'Untitled'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={step === 'Preview' ? handleUpdate : goNext}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? (
              'Saving…'
            ) : step === 'Preview' ? (
              <>
                <CheckIcon width={14} height={14} />
                Save Changes
              </>
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </div>

      {/* ── Stepper Navigation ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-xs">
        <nav aria-label="Progress" className="flex items-center justify-between">
          {steps.map((label, index) => {
            const isCompleted = index < stepIndex;
            const isCurrent = index === stepIndex;
            return (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(index)}
                className={cx(
                  'group flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                  isCurrent
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isCompleted
                      ? 'text-slate-800 hover:bg-slate-100/70'
                      : 'text-slate-400 hover:bg-slate-50'
                )}
              >
                <div
                  className={cx(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all',
                    isCurrent
                      ? 'bg-white text-slate-900'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {isCompleted ? <CheckIcon width={14} height={14} className="stroke-3" /> : index + 1}
                </div>
                <div className="hidden sm:block min-w-0">
                  <p
                    className={cx(
                      'text-xs font-semibold tracking-wide',
                      isCurrent ? 'text-white' : 'text-slate-800'
                    )}
                  >
                    {label}
                  </p>
                  <p
                    className={cx(
                      'text-[10px] truncate',
                      isCurrent ? 'text-slate-300' : 'text-slate-400'
                    )}
                  >
                    {index === 0 && 'Title & Details'}
                    {index === 1 && `${allActiveImages.length} Photos`}
                    {index === 2 && 'KES ' + (price || '0')}
                    {index === 3 && 'Review & Save'}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── STEP 1: Basic Info ────────────────────────────────────────────── */}
      {step === 'Basic Info' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif text-xl font-normal text-slate-900">Basic Information</h2>
            <p className="mt-1 text-xs text-slate-500">
              Update the product title, collection category, and styling specifications.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="product-name">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="e.g. Silk Lace Frontal Wig"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="product-sku">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  id="product-sku"
                  type="text"
                  placeholder="e.g. DL-HD-001"
                  className={inputClass}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="product-status">
                  Visibility Status
                </label>
                <select
                  id="product-status"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                  className={inputClass}
                >
                  <option value="active">Active (Visible in Store)</option>
                  <option value="inactive">Draft / Hidden</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="product-desc">
                Description
              </label>
              <textarea
                id="product-desc"
                rows={4}
                placeholder="Highlight texture, cut, lace features, and care instructions…"
                className={inputClass}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        </div>
      )}

      {/* ── STEP 2: Images ────────────────────────────────────────────── */}
      {step === 'Images' && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif text-xl font-normal text-slate-900">Product Images</h2>
            <p className="mt-1 text-xs text-slate-500">
              Manage existing photos or upload new high-resolution images. Click a photo to set as primary cover.
            </p>
          </div>

          <label
            htmlFor="product-images"
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-10 text-center transition-all duration-200 hover:border-slate-800 hover:bg-slate-100/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs border border-slate-200">
              <UploadIcon width={22} height={22} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Click or drag images here to upload more photos
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supports JPG, PNG, WEBP. High resolution recommended.
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

          {allActiveImages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Catalogue Photos ({allActiveImages.length})
                </p>
                <p className="text-[11px] text-slate-400">
                  Star an image to make it the primary cover
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                {allActiveImages.map((image, index) => {
                  const isPrimary = image.ref === primaryImageRef || (!primaryImageRef && index === 0);
                  return (
                    <div
                      key={image.ref}
                      className={cx(
                        'group relative aspect-square overflow-hidden rounded-xl border bg-slate-100 shadow-2xs transition-all',
                        isPrimary ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
                      )}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />

                      {/* Primary Badge or Set Primary Button */}
                      {isPrimary ? (
                        <span className="absolute top-2 left-2 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-xs">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(image.ref)}
                          className="absolute top-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 opacity-0 shadow-xs transition-opacity duration-200 group-hover:opacity-100 hover:bg-white hover:text-slate-900"
                        >
                          Make Primary
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() =>
                          image.isNew
                            ? handleRemoveNewImage(image.newIndex!)
                            : handleRemoveExistingImage(image.id!)
                        }
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-xs text-red-600 opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-50"
                        aria-label="Remove image"
                      >
                        <Trash2Icon width={13} height={13} />
                      </button>

                      <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        #{index + 1} {image.isNew && '• New'}
                      </span>
                    </div>
                  );
                })}
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
            <h3 className="text-sm font-semibold text-slate-800">Price, Attributes &amp; Stock</h3>
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
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700 font-normal">
                {sizes.length} sizes, {colors.length} colors
              </span>
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
                      <strong className="text-slate-600">+ Add Size</strong> above to define custom
                      lengths or sizes.
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
                      <strong className="text-slate-600">+ Add Color</strong> above to link custom
                      shades with photos.
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
                          {colors.map((c) => {
                            const linkedImg = allActiveImages.find(
                              (img) => img.ref === c.image_ref
                            );
                            return (
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
                                  {allActiveImages.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <select
                                        value={c.image_ref || ''}
                                        onChange={(e) =>
                                          handleUpdateColor(
                                            c.id,
                                            'image_ref',
                                            e.target.value === '' ? null : e.target.value
                                          )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
                                      >
                                        <option value="">No linked photo</option>
                                        {allActiveImages.map((img, i) => (
                                          <option key={img.ref} value={img.ref}>
                                            Photo #{i + 1} {img.isNew ? '(New)' : ''}
                                          </option>
                                        ))}
                                      </select>
                                      {linkedImg && (
                                        <Image
                                          src={linkedImg.url}
                                          alt=""
                                          width={24}
                                          height={24}
                                          className="rounded-md object-cover border border-slate-200"
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">None available</span>
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
                                    placeholder={price || 'Default'}
                                    value={c.price}
                                    onChange={(e) => handleUpdateColor(c.id, 'price', e.target.value)}
                                    className="w-24 sm:w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:border-slate-800 focus:outline-none"
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
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 4: Preview & Save ────────────────────────────────────────── */}
      {step === 'Preview' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="font-serif text-xl font-normal text-slate-900">Review Changes</h2>
            <p className="mt-1 text-xs text-slate-500">
              Check all attributes before saving changes to the boutique store.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Product Live Card Preview */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Storefront Card Preview
                </span>
                <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm max-w-sm">
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    {primaryDisplayImage ? (
                      <Image
                        src={primaryDisplayImage}
                        alt={name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                        No image uploaded
                      </div>
                    )}
                    {featured && (
                      <span className="absolute top-3 left-3 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Featured
                      </span>
                    )}
                    {!isActive && (
                      <span className="absolute top-3 right-3 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      {categories.find((c) => String(c.id) === categoryId)?.name || 'Human Hair'}
                    </p>
                    <h3 className="font-medium text-slate-900 text-sm line-clamp-1">
                      {name || 'Untitled Piece'}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {formatKsh(Number(price) || 0)}
                      </span>
                      {compareAtPrice && Number(compareAtPrice) > Number(price) && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatKsh(Number(compareAtPrice))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Attributes */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Catalogue Specifications
                </span>
                <dl className="divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">Category</dt>
                    <dd className="font-semibold text-slate-900">
                      {categories.find((c) => String(c.id) === categoryId)?.name || '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">Hairstyle / Texture</dt>
                    <dd className="font-semibold text-slate-900">
                      {hairstyles.find((h) => String(h.id) === hairstyleId)?.name || 'Natural'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">SKU</dt>
                    <dd className="font-mono text-slate-900">{sku || '—'}</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">Inventory Status</dt>
                    <dd className="font-semibold text-slate-900">
                      {Number(stock) > 0 ? `${stock} in stock` : 'Out of stock'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">Total Photos</dt>
                    <dd className="font-semibold text-slate-900">{allActiveImages.length} images</dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">Sizes Configured</dt>
                    <dd className="font-semibold text-slate-900">
                      {sizes.filter((s) => s.name.trim()).length > 0
                        ? sizes
                            .filter((s) => s.name.trim())
                            .map((s) => s.name)
                            .join(', ')
                        : 'None'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-500">Colors Configured</dt>
                    <dd className="font-semibold text-slate-900">
                      {colors.filter((c) => c.name.trim()).length > 0
                        ? colors
                            .filter((c) => c.name.trim())
                            .map((c) => c.name)
                            .join(', ')
                        : 'None'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer Navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-t border-slate-200/80 pt-6">
        <button
          type="button"
          onClick={goPrevious}
          disabled={stepIndex === 0 || submitting}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-40"
        >
          Previous
        </button>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={step === 'Preview' ? handleUpdate : goNext}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-slate-800 disabled:opacity-50"
          >
            {submitting ? (
              'Saving…'
            ) : step === 'Preview' ? (
              <>
                <CheckIcon width={14} height={14} />
                Save Changes
              </>
            ) : (
              'Next Step'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
