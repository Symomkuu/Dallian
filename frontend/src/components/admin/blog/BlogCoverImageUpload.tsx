'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import {
  CheckCircle2Icon,
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      pushToast({ title: 'Please select an image file (PNG, JPG, or WEBP).', tone: 'error' });
      return;
    }
    try {
      setIsUploadingImage(true);
      const res = await uploadImageToCloudinary(file);
      onCoverImageChange(res.secureUrl);
      pushToast({
        title: 'Cover image uploaded successfully!',
        tone: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      pushToast({ title: `Upload failed: ${msg}`, tone: 'error' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-ink/10 pb-2">
        <div>
          <h3 className="font-serif text-base text-ink">Cover Banner Image</h3>
          <p className="text-[11px] text-ink/50">Upload a featured cover image for this article</p>
        </div>
        {coverImage && (
          <button
            type="button"
            onClick={() => onCoverImageChange('')}
            className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <Trash2Icon className="h-3 w-3" /> Remove
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Upload Zone (shown when no cover image or during upload) */}
      {!coverImage ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cx(
            'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-[#D99B26] bg-cream/60'
              : 'border-ink/20 hover:border-[#D99B26] hover:bg-cream/40',
            isUploadingImage && 'pointer-events-none opacity-60'
          )}
        >
          {isUploadingImage ? (
            <Loader2Icon className="h-8 w-8 animate-spin text-[#D99B26]" />
          ) : (
            <UploadCloudIcon className="h-8 w-8 text-ink/40" />
          )}
          <p className="mt-2 text-xs font-semibold text-ink">
            {isUploadingImage ? 'Uploading to cloud...' : 'Click to select or drop an image'}
          </p>
          <p className="mt-0.5 text-[10px] text-ink/50">PNG, JPG, or WEBP up to 5MB</p>
        </div>
      ) : (
        /* Live Preview Display with Replace / Remove controls */
        <div className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-ink/10 bg-cream/40 shadow-2xs group">
            <Image
              src={coverImage}
              alt="Cover preview"
              fill
              className="object-cover"
              unoptimized
            />
            {isUploadingImage ? (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white">
                <Loader2Icon className="h-6 w-6 animate-spin text-[#D99B26]" />
                <span className="text-xs font-medium">Uploading replacement...</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-[#D99B26] shadow-sm transition-colors"
                >
                  Replace Image
                </button>
                <button
                  type="button"
                  onClick={() => onCoverImageChange('')}
                  className="rounded-full bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shadow-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-ink/70">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
              <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600" />
              Image uploaded
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#8B3A2A] hover:underline"
            >
              Upload another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
