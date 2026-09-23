import React from 'react';
import { LinkButton } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({ icon, title, body, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-ink/15 bg-white px-8 py-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 text-chestnut">
        {icon}
      </div>
      <h2 className="font-serif text-2xl text-ink">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/60">{body}</p>
      {actionLabel && actionTo &&
      <LinkButton to={actionTo} className="mt-7">
          {actionLabel}
        </LinkButton>
      }
    </div>);

}