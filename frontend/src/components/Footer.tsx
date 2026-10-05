'use client';

import React from 'react';
import Image from 'next/image';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from '@/components/RouterCompat';
import { brand } from '../data/brand';

const columns = [
  {
    heading: 'SHOP',
    links: [
      { label: 'Explore Categories', to: '/categories' },
      { label: 'Human Hair', to: '/shop?category=human-hair' },
      { label: 'Japanese Futura', to: '/shop?category=futura' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
      { label: 'Featured', to: '/shop?badge=featured' },
    ],
  },
  {
    heading: 'CUSTOMER CARE',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Delivery', to: '/delivery' },
      { label: 'Returns', to: '/returns' },
      { label: 'Studio Services', to: '/services' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Track Order', to: '/track' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-16 lg:px-12 lg:py-20">
        {/* Top Section: Logo & Columns */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-12">
          {/* Brand Info */}
          <div>
            <Image
              src={brand.logo}
              alt={brand.name}
              width={160}
              height={80}
              className="h-14 w-auto object-contain sm:h-20"
              style={{ width: 'auto', height: 'auto' }}
              unoptimized
            />

            <h3 className="mt-4 font-serif text-xl font-normal text-white sm:mt-6 sm:text-2xl">
              {brand.name}
            </h3>
            <p className="mt-1 text-sm italic text-[#C89D34]">
              {brand.tagline}
            </p>

            {/* Social Icons */}
            <div className="mt-4 flex gap-2.5 sm:mt-6">
              {/* Instagram */}
              <a
                href={brand.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-200 hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <svg
                  className="h-4 w-4 fill-none stroke-current"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                href={brand.socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-200 hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <svg
                  className="h-3.5 w-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.99v7.94c.03 2.1-.64 4.29-2.06 5.86-1.64 1.83-4.14 2.64-6.57 2.21-2.52-.43-4.69-2.22-5.63-4.59-.97-2.43-.65-5.32.85-7.39 1.48-2.05 4.02-3.13 6.54-2.79v4.18c-.89-.25-1.89-.13-2.67.36-.88.54-1.4 1.55-1.37 2.58.02 1.09.68 2.08 1.69 2.5 1.02.43 2.24.27 3.09-.43.68-.56 1.05-1.43 1.04-2.31V.02z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href={brand.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-200 hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <svg
                  className="h-3.5 w-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Columns: 2-up on mobile, becomes 3 real grid cells at lg */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:contents">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C89D34] sm:text-[11px] sm:tracking-[0.25em]">
                  {column.heading}
                </h4>
                <ul className="mt-3 space-y-2.5 sm:mt-6 sm:space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-white/80 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Middle Section: Contact Details */}
        <div className="mt-10 border-t border-white/10 pt-6 sm:mt-16 sm:pt-8">
          <div className="grid gap-4 text-sm text-white/80 sm:grid-cols-3 sm:items-center sm:gap-6">
            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#C89D34]" />
              <span className="leading-snug">
                Mountain Mall, Thika Road
                <br />
                Nairobi, Kenya
              </span>
            </div>

            {/* Phone */}
            <a
              href={`tel:${brand.phone.replace(/\s/g, '')}`}
              className="flex items-center gap-3 transition-colors hover:text-white"
            >
              <Phone className="h-4 w-4 shrink-0 text-[#C89D34]" />
              <span>0792 11 42 92</span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${brand.email}`}
              className="flex items-center gap-3 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4 shrink-0 text-[#C89D34]" />
              <span>dallianltd@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Admin */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-[11px] text-white/50 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-6">
          <p>© 2026 Dallian Luxe Hair. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;