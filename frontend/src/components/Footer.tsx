'use client';

import React from 'react';
import { Globe, Mail, MapPin, Phone, Sparkles, Store } from 'lucide-react';
import { Link } from '@/components/RouterCompat';
import { brand } from '../data/brand';

const columns = [
{
  heading: 'Shop',
  links: [
  { label: 'Human Hair', to: '/shop?category=human-hair' },
  { label: 'Japanese Futura', to: '/shop?category=futura' },
  { label: 'New Arrivals', to: '/shop?sort=newest' },
  { label: 'Featured', to: '/shop?badge=featured' }]

},
{
  heading: 'Customer Care',
  links: [
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Delivery', to: '/delivery' },
  { label: 'Returns', to: '/returns' },
  { label: 'Wig Care', to: '/wig-care' }]

},
{
  heading: 'Company',
  links: [
  { label: 'About Us', to: '/about' },
  { label: 'Track Order', to: '/track' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' }]

}];


export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-page px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-20 w-auto border border-gold/30 object-cover"
              loading="lazy" />
            
            <p className="mt-5 font-serif text-xl leading-snug text-cream">{brand.name}</p>
            <p className="mt-1.5 text-sm italic text-gold">{brand.tagline}</p>
            <div className="mt-6 flex gap-3">
              {[Sparkles, Globe, Store].map((Icon, index) =>
              <a
                key={index}
                href="#"
                aria-label="Social profile"
                className="flex h-9 w-9 items-center justify-center border border-cream/20 text-cream/70 transition-colors duration-200 hover:border-gold hover:text-gold">
                
                  <Icon width={15} height={15} />
                </a>
              )}
            </div>
          </div>

          {columns.map((column) =>
          <nav key={column.heading} aria-label={column.heading}>
              <h2 className="label-luxe text-gold">{column.heading}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) =>
              <li key={link.label}>
                    <Link
                  to={link.to}
                  className="text-sm text-cream/65 transition-colors duration-200 hover:text-cream">
                  
                      {link.label}
                    </Link>
                  </li>
              )}
              </ul>
            </nav>
          )}
        </div>

        <div className="mt-14 border-t border-cream/12 pt-8">
          <div className="grid gap-5 text-sm text-cream/65 sm:grid-cols-3">
            <p className="flex items-start gap-2.5">
              <MapPin width={15} height={15} className="mt-0.5 shrink-0 text-gold" />
              <span>
                {brand.addressLine1}
                <br />
                {brand.addressLine2}
              </span>
            </p>
            <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="flex items-center gap-2.5 hover:text-cream">
              <Phone width={15} height={15} className="shrink-0 text-gold" />
              {brand.phone}
            </a>
            <a href={`mailto:${brand.email}`} className="flex items-center gap-2.5 hover:text-cream">
              <Mail width={15} height={15} className="shrink-0 text-gold" />
              {brand.email}
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-cream/12 pt-6 text-[11px] tracking-wide text-cream/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <Link to="/admin" className="transition-colors duration-200 hover:text-gold">
            Admin Dashboard
          </Link>
        </div>
      </div>
    </footer>);

}

export default Footer;