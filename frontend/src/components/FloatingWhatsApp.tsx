'use client';

import React, { useEffect, useRef, useState } from 'react';
import { brand } from '@/data/brand';

/**
 * Floating, draggable WhatsApp button that appears on every page.
 * - Defaults to bottom-right corner.
 * - Can be freely dragged across the screen on both desktop and mobile so it never obscures content.
 * - Distinguishes between dragging and clicking: clicking opens WhatsApp chat directly.
 */
export function FloatingWhatsApp() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  const buttonRef = useRef<HTMLDivElement>(null);

  // Set default initial position on the bottom-right once mounted in the browser
  useEffect(() => {
    setMounted(true);
    const updateDefaultPos = () => {
      const buttonSize = 56;
      const margin = 24;
      setPosition({
        x: Math.max(10, window.innerWidth - buttonSize - margin),
        y: Math.max(10, window.innerHeight - buttonSize - margin),
      });
    };

    updateDefaultPos();
    window.addEventListener('resize', updateDefaultPos);
    return () => window.removeEventListener('resize', updateDefaultPos);
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!position) return;
    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  // Touch drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!position || e.touches.length === 0) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        setHasMoved(true);
      }

      const buttonSize = 56;
      const newX = Math.min(window.innerWidth - buttonSize - 10, Math.max(10, dragStartRef.current.initialX + dx));
      const newY = Math.min(window.innerHeight - buttonSize - 10, Math.max(10, dragStartRef.current.initialY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        setHasMoved(true);
      }

      const buttonSize = 56;
      const newX = Math.min(window.innerWidth - buttonSize - 10, Math.max(10, dragStartRef.current.initialX + dx));
      const newY = Math.min(window.innerHeight - buttonSize - 10, Math.max(10, dragStartRef.current.initialY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    // If the user was dragging the button, don't trigger the click
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const message = encodeURIComponent(
      'Hello Dallian Luxe Hair, I have an inquiry about your luxury wigs.'
    );
    const whatsappUrl = `https://wa.me/${brand.phoneIntl}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (!mounted || !position) return null;

  return (
    <div
      ref={buttonRef}
      role="button"
      tabIndex={0}
      aria-label="Chat on WhatsApp with Dallian Luxe Hair"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-50 flex items-center justify-center select-none group focus:outline-none transition-shadow ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      }`}
    >
      {/* Tooltip on hover */}
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-ink/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm sm:group-hover:block transition-opacity">
        Chat with Us on WhatsApp
      </span>

      {/* Button Circle */}
      <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba59] active:scale-95 transition-all">
        {/* Soft pulse animation halo */}
        <span
          aria-hidden="true"
          className="absolute -inset-1 rounded-full bg-[#25D366]/35 animate-ping -z-10"
        />

        {/* Official WhatsApp Vector Logo */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="drop-shadow-xs"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413z" />
        </svg>
      </div>
    </div>
  );
}
