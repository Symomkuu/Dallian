import React from 'react';
import { cx } from '../utils/format';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  body?: string;
  onDark?: boolean;
  align?: 'left' | 'center';
  className?: string;
  as?: 'h2' | 'h3';
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  onDark,
  align = 'left',
  className,
  as: Tag = 'h2'
}: SectionHeadingProps) {
  return (
    <div
      className={cx(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}>
      
      {eyebrow && <p className="label-luxe mb-3 text-gold">{eyebrow}</p>}
      <Tag
        className={cx(
          'font-serif text-3xl leading-[1.12] sm:text-4xl',
          onDark ? 'text-cream' : 'text-ink'
        )}>
        
        {title}
      </Tag>
      {body &&
      <p className={cx('mt-4 text-sm leading-relaxed sm:text-base', onDark ? 'text-cream/65' : 'text-ink/65')}>
          {body}
        </p>
      }
    </div>);

}