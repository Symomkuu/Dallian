'use client';

import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from '@/components/RouterCompat';
import { brand } from '../data/brand';

const columns = [
  {
    heading: 'SHOP',
    links: [
      { label: 'Human Hair', to: '/?category=human-hair' },
      { label: 'Japanese Futura', to: '/?category=futura' },
      { label: 'New Arrivals', to: '/?sort=newest' },
      { label: 'Featured', to: '/?badge=featured' },
    ],
  },
  {
    heading: 'CUSTOMER CARE',
    links: [
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Delivery', to: '/delivery' },
      { label: 'Returns', to: '/returns' },
      { label: 'Wig Care', to: '/wig-care' },
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
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        {/* Top Section: Logo & Columns */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Brand Info */}
          <div>
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-20 w-auto object-contain"
              loading="lazy"
            />

            <h3 className="mt-6 font-serif text-2xl font-normal text-white">
              {brand.name}
            </h3>
            <p className="mt-1 text-sm italic text-[#C89D34]">
              {brand.tagline}
            </p>

            {/* Social Icons */}
            <div className="mt-6 flex gap-2.5">
              {/* Instagram SVG */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-200 hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <svg
                  className="h-3.5 w-3.5 fill-none stroke-current"
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

              {/* Facebook SVG */}
              <a
                href="#"
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

              {/* Twitter / X SVG */}
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-200 hover:border-[#C89D34] hover:text-[#C89D34]"
              >
                <svg
                  className="h-3.5 w-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation Columns */}
          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h4 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C89D34]">
                {column.heading}
              </h4>
              <ul className="mt-6 space-y-3.5">
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

        {/* Middle Section: Contact Details */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="grid gap-6 text-sm text-white/80 sm:grid-cols-3 sm:items-center">
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
        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Dallian Luxe Hair. All rights reserved.</p>
          <Link
            to="/admin"
            className="transition-colors duration-200 hover:text-[#C89D34]"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;