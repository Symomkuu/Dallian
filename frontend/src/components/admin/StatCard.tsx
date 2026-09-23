import React from 'react';
import { cx } from '../../utils/format';

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  tone?: 'default' | 'alert' | 'feature';
  icon?: React.ReactNode;
}

export function StatCard({ label, value, delta, tone = 'default', icon }: StatCardProps) {
  return (
    <div
      className={cx(
        'flex flex-col border p-6',
        tone === 'feature' && 'border-gold/40 bg-ink text-cream',
        tone === 'alert' && 'border-chestnut/30 bg-white',
        tone === 'default' && 'border-ink/10 bg-white'
      )}>
      
      <div className="flex items-start justify-between gap-3">
        <p className={cx('label-luxe', tone === 'feature' ? 'text-cream/55' : 'text-ink/50')}>{label}</p>
        {icon && <span className={tone === 'feature' ? 'text-gold' : 'text-chestnut'}>{icon}</span>}
      </div>
      <p
        className={cx(
          'mt-4 font-serif',
          tone === 'feature' ? 'text-4xl text-cream' : 'text-3xl text-ink'
        )}>
        
        {value}
      </p>
      {delta &&
      <p className={cx('mt-2 text-xs', tone === 'feature' ? 'text-gold' : 'text-ink/55')}>{delta}</p>
      }
    </div>);

}