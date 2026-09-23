import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  body?: string;
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, body, actions }: AdminPageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-5 border-b border-ink/10 pb-6">
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {body && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/60">{body}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </div>);

}