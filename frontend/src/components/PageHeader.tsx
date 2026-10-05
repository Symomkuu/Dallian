import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  body?: string;
  crumbs?: Crumb[];
}

export function PageHeader({ title, eyebrow, body, crumbs }: PageHeaderProps) {
  return (
    <header className="border-b border-ink/10 bg-white">
      <div className="mx-auto max-w-page px-4 py-8 sm:px-8 sm:py-10 lg:py-14">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[11px] tracking-wide text-ink/50">
              {crumbs.map((crumb, index) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  {crumb.to ? (
                    <Link
                      href={crumb.to}
                      className="transition-colors duration-150 hover:text-chestnut"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink/80">{crumb.label}</span>
                  )}
                  {index < crumbs.length - 1 && (
                    <ChevronRightIcon width={12} height={12} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="label-luxe mb-2.5 text-gold sm:mb-3">{eyebrow}</p>}
        <h1 className="font-serif text-3xl leading-[1.1] text-ink sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {body && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/65 sm:mt-5 sm:text-base">
            {body}
          </p>
        )}
      </div>
    </header>
  );
}