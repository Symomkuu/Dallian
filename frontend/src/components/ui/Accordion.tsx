import React, { useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number | null;
}

export function Accordion({ items, defaultOpen = null }: AccordionProps) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div className="divide-y divide-ink/10 border-y border-ink/10">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.title}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-chestnut">
                
                <span className="font-serif text-lg leading-snug">{item.title}</span>
                <span className="shrink-0 text-gold">
                  {isOpen ? <MinusIcon width={18} height={18} /> : <PlusIcon width={18} height={18} />}
                </span>
              </button>
            </h3>
            {isOpen &&
            <div className="pb-6 pr-10 text-sm leading-relaxed text-ink/70">{item.content}</div>
            }
          </div>);

      })}
    </div>);

}