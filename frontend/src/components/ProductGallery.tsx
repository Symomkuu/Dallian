import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon, XIcon } from 'lucide-react';
import { cx } from '../utils/format';

interface ProductGalleryProps {
  images: string[];
  name: string;
  activeImage?: string;
}

export function ProductGallery({ images, name, activeImage }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!activeImage) return;
    const clean = (u: string) => u.split('?')[0].replace(/^https?:\/\/[^/]+/, '');
    const target = clean(activeImage);
    const idx = images.findIndex((img) => img === activeImage || clean(img) === target);
    if (idx !== -1) {
      setActive(idx);
    }
  }, [activeImage, images]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFullscreen(false);
      if (event.key === 'ArrowRight') setActive((i) => (i + 1) % images.length);
      if (event.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length);
    };
    if (fullscreen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fullscreen, images.length]);

  const currentDisplayImage = images[active] || activeImage || '/ee976c31-e0c9-4d59-a85f-bc2c81c58448.jpg';

  return (
    <div key={name}>
      <div className="relative overflow-hidden bg-cream-deep">
        <img
          src={currentDisplayImage}
          alt={`${name} — view ${active + 1} of ${images.length}`}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          className={cx(
            'aspect-[4/5] w-full object-cover transition-transform duration-500 ease-[var(--ease-luxe)]',
            zoom && 'scale-[1.35]'
          )} />
        
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label="View image fullscreen"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center bg-white/90 text-ink transition-colors duration-200 hover:bg-ink hover:text-gold">
          
          <ExpandIcon width={16} height={16} />
        </button>
        <p className="absolute bottom-4 left-4 bg-ink/70 px-3 py-1.5 text-[10px] tracking-luxe text-cream max-lg:hidden">
          Hover to zoom
        </p>
      </div>

      <div className="mt-3 flex gap-3">
        {images.map((image, index) =>
        <button
          key={image}
          type="button"
          onClick={() => setActive(index)}
          aria-label={`Show image ${index + 1}`}
          aria-current={active === index}
          className={cx(
            'w-1/4 max-w-24 overflow-hidden border transition-colors duration-200',
            active === index ? 'border-gold' : 'border-ink/12 hover:border-ink/40'
          )}>
          
            <img src={image} alt="" className="aspect-[4/5] w-full object-cover" loading="lazy" />
          </button>
        )}
      </div>

      {fullscreen &&
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4">
          <button
          type="button"
          onClick={() => setFullscreen(false)}
          aria-label="Close fullscreen"
          className="absolute right-5 top-5 p-2 text-cream/70 hover:text-cream">
          
            <XIcon width={24} height={24} />
          </button>
          <button
          type="button"
          onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
          aria-label="Previous image"
          className="absolute left-4 p-3 text-cream/70 hover:text-gold">
          
            <ChevronLeftIcon width={28} height={28} />
          </button>
          <img
          src={currentDisplayImage}
          alt={`${name} — view ${active + 1}`}
          className="max-h-[88vh] w-auto object-contain" />
        
          <button
          type="button"
          onClick={() => setActive((i) => (i + 1) % images.length)}
          aria-label="Next image"
          className="absolute right-4 p-3 text-cream/70 hover:text-gold">
          
            <ChevronRightIcon width={28} height={28} />
          </button>
        </div>
      }
    </div>);

}