'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  LinkIcon,
  Loader2Icon,
  Trash2Icon,
  UploadCloudIcon,
} from 'lucide-react';
import { uploadImageToCloudinary } from '@/utils/cloudinary';
import { useStore } from '@/contexts/StoreContext';
import { cx } from '@/utils/format';

interface BlogCoverImageUploadProps {
  coverImage: string;
  onCoverImageChange: (url: string) => void;
}

export function BlogCoverImageUpload({
  coverImage,
  onCoverImageChange,
}: BlogCoverImageUploadProps) {
  const { pushToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      pushToast({ title: 'Please select an image file.', tone: 'error' });
      return;
    }
    try {
      setIsUploadingImage(true);
      const res = await uploadImageToCloudinary(file);
      onCoverImageChange(res.secureUrl);
      pushToast({
        title: 'Image uploaded to Cloudinary & link autofilled!',
        tone: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      pushToast({ title: `Upload failed: ${msg}`, tone: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-ink/10 pb-2">
        <div>
          <h3 className="font-serif text-base text-ink">Cover Banner Image</h3>
          <p className="text-[11px] text-ink/50">Upload to Cloudinary or paste an image link directly</p>
        </div>
        {coverImage && (
          <button
            type="button"
            onClick={() => onCoverImageChange('')}
            className="text-xs text-red-600 hover:underline inline-flex items-center gap-1"
          >
            <Trash2Icon className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-cream/40 p-1 text-xs border border-ink/10">
        <button
          type="button"
          onClick={() => setImageInputMode('upload')}
          className={cx(
            'flex-1 rounded-lg py-1.5 font-medium transition-all text-center inline-flex items-center justify-center gap-1.5',
            imageInputMode === 'upload'
              ? 'bg-white shadow-2xs text-ink font-semibold'
              : 'text-ink/60 hover:text-ink'
          )}
        >
          <UploadCloudIcon className="h-3.5 w-3.5 text-[#D99B26]" />
          Upload File (Cloudinary)
        </button>
        <button
          type="button"
          onClick={() => setImageInputMode('url')}
          className={cx(
            'flex-1 rounded-lg py-1.5 font-medium transition-all text-center inline-flex items-center justify-center gap-1.5',
            imageInputMode === 'url'
              ? 'bg-white shadow-2xs text-ink font-semibold'
              : 'text-ink/60 hover:text-ink'
          )}
        >
          <LinkIcon className="h-3.5 w-3.5 text-[#8B3A2A]" />
          Paste Image Link
        </button>
      </div>

      {/* Mode 1: File Upload */}
      {imageInputMode === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cx(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 p-5 text-center transition-all cursor-pointer hover:border-[#D99B26] hover:bg-cream/40',
            isUploadingImage && 'pointer-events-none opacity-60'
          )}
        >
          {isUploadingImage ? (
            <Loader2Icon className="h-7 w-7 animate-spin text-[#D99B26]" />
          ) : (
            <UploadCloudIcon className="h-7 w-7 text-ink/40" />
          )}
          <p className="mt-2 text-xs font-semibold text-ink">
            {isUploadingImage ? 'Uploading & saving to Cloudinary...' : 'Click to select or drop image'}
          </p>
          <p className="mt-0.5 text-[10px] text-ink/50">PNG, JPG, or WEBP up to 5MB (autofills link)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageFile(file);
            }}
            className="hidden"
          />
        </div>
      )}

      {/* Mode 2: Direct Link Input */}
      {imageInputMode === 'url' && (
        <div>
          <label htmlFor="cover-url-manual" className="block text-[11px] font-medium text-ink/70">
            Enter image web address (URL):
          </label>
          <input
            id="cover-url-manual"
            type="url"
            placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
            value={coverImage}
            onChange={(e) => onCoverImageChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/15 bg-cream/30 px-3 py-2 text-xs text-ink placeholder:text-ink/30 focus:border-[#D99B26] focus:bg-white focus:outline-none"
          />
        </div>
      )}

      {/* Autofilled Image URL Field */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-medium text-ink/70">
          <span>Active Image Link (autofilled):</span>
          {coverImage && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(coverImage);
                pushToast({ title: 'Image link copied to clipboard!', tone: 'success' });
              }}
              className="text-[10px] text-[#8B3A2A] hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Copy Link
            </button>
          )}
        </div>
        <input
          type="text"
          value={coverImage}
          onChange={(e) => onCoverImageChange(e.target.value)}
          placeholder="No image uploaded or entered yet"
          className="mt-1 w-full rounded-xl border border-ink/15 bg-cream/20 px-3 py-1.5 font-mono text-[11px] text-ink focus:border-[#D99B26] focus:bg-white focus:outline-none"
        />
      </div>

      {/* Live Preview Display */}
      {coverImage && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-ink/60">Live Image Preview:</p>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink/10 bg-cream/40 shadow-2xs group">
            <Image
              src={coverImage}
              alt="Cover preview"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-[#D99B26] shadow-sm transition-colors"
              >
                Replace File
              </button>
              <button
                type="button"
                onClick={() => onCoverImageChange('')}
                className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 shadow-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
