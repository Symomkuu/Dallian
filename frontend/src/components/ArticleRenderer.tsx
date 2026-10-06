import React from 'react';
import Image from 'next/image';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export type ArticleBlock =
  | { type: 'h2'; id: string; text: string }
  | { type: 'h3'; id: string; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'bullet-list'; items: string[] }
  | { type: 'numbered-list'; items: string[] }
  | { type: 'hr' }
  | { type: 'image'; src: string; alt: string }
  | { type: 'paragraph'; text: string };

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const isSafeLinkUrl = (u: string): boolean => {
  const trimmed = u.trim().toLowerCase();
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  );
};

const isSafeImageUrl = (src: string): boolean => {
  const trimmed = src.trim().toLowerCase();
  return (
    trimmed.startsWith('/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  );
};

/**
 * Safely parse markdown inline tokens (**bold**, *italic*, [link](url))
 * into pure React elements without any HTML string injection.
 */
export function renderInlineContent(text: string): React.ReactNode {
  if (!text) return null;

  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, rawUrl] = linkMatch;
      const url = rawUrl.trim();
      if (!isSafeLinkUrl(url)) {
        return <React.Fragment key={index}>{label}</React.Fragment>;
      }
      const isInternal = url.startsWith('/') || url.startsWith('#');
      return (
        <a
          key={index}
          href={url}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className="text-[#8B3A2A] underline decoration-[#D99B26] underline-offset-4 hover:text-[#D99B26] transition-colors font-medium"
        >
          {label}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *text*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Plain text
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Parse markdown into structured typed blocks and Table of Contents items.
 */
export function parseArticleBlocks(markdown: string): {
  blocks: ArticleBlock[];
  toc: TocItem[];
} {
  if (!markdown) return { blocks: [], toc: [] };

  const lines = markdown.split('\n');
  const blocks: ArticleBlock[] = [];
  const toc: TocItem[] = [];
  const usedIds = new Set<string>();

  let currentBullets: string[] | null = null;
  let currentNumbers: string[] | null = null;

  const flushBullets = () => {
    if (currentBullets && currentBullets.length > 0) {
      blocks.push({ type: 'bullet-list', items: currentBullets });
      currentBullets = null;
    }
  };

  const flushNumbers = () => {
    if (currentNumbers && currentNumbers.length > 0) {
      blocks.push({ type: 'numbered-list', items: currentNumbers });
      currentNumbers = null;
    }
  };

  const flushLists = () => {
    flushBullets();
    flushNumbers();
  };

  const getUniqueId = (text: string, fallbackIdx: number): string => {
    const baseId = slugifyHeading(text) || `section-${fallbackIdx}`;
    let uniqueId = baseId;
    let counter = 1;
    while (usedIds.has(uniqueId)) {
      uniqueId = `${baseId}-${counter++}`;
    }
    usedIds.add(uniqueId);
    return uniqueId;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();

    // Blank line
    if (!line.trim()) {
      flushLists();
      continue;
    }

    // Heading 2: ##
    if (line.startsWith('## ')) {
      flushLists();
      const text = line.slice(3).trim();
      const id = getUniqueId(text, i);
      toc.push({ id, text, level: 2 });
      blocks.push({ type: 'h2', id, text });
      continue;
    }

    // Heading 3: ###
    if (line.startsWith('### ')) {
      flushLists();
      const text = line.slice(4).trim();
      const id = getUniqueId(text, i);
      toc.push({ id, text, level: 3 });
      blocks.push({ type: 'h3', id, text });
      continue;
    }

    // Blockquote: >
    if (line.startsWith('> ')) {
      flushLists();
      blocks.push({ type: 'blockquote', text: line.slice(2).trim() });
      continue;
    }

    // Bullet List: - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushNumbers();
      const itemText = line.slice(2).trim();
      if (!currentBullets) {
        currentBullets = [];
      }
      currentBullets.push(itemText);
      continue;
    }

    // Numbered List: 1.
    if (/^\d+\.\s/.test(line)) {
      flushBullets();
      const itemText = line.replace(/^\d+\.\s/, '').trim();
      if (!currentNumbers) {
        currentNumbers = [];
      }
      currentNumbers.push(itemText);
      continue;
    }

    flushLists();

    // Horizontal Rule: --- or ***
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push({ type: 'hr' });
      continue;
    }

    // Image: ![alt](url)
    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1].trim();
      const src = imgMatch[2].trim();
      if (isSafeImageUrl(src)) {
        blocks.push({ type: 'image', alt, src });
        continue;
      }
    }

    // Regular paragraph
    blocks.push({ type: 'paragraph', text: line });
  }

  flushLists();

  return { blocks, toc };
}

interface ArticleRendererProps {
  blocks?: ArticleBlock[];
  content?: string;
  emptyFallback?: React.ReactNode;
}

/**
 * Pure React component to render article blocks safely with native React elements.
 */
export function ArticleRenderer({ blocks: propBlocks, content, emptyFallback }: ArticleRendererProps) {
  const blocks = React.useMemo(() => {
    if (propBlocks) return propBlocks;
    if (content) return parseArticleBlocks(content).blocks;
    return [];
  }, [propBlocks, content]);

  if (blocks.length === 0) {
    return (
      emptyFallback ?? (
        <p className="text-ink/40 italic">No content yet. Start writing your story above...</p>
      )
    );
  }

  return (
    <div className="space-y-6 text-ink font-sans">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'h2':
            return (
              <h2
                key={index}
                id={block.id}
                className="scroll-mt-28 font-serif text-2xl sm:text-3xl font-medium text-ink mt-10 mb-4 pb-2 border-b border-ink/10"
              >
                {renderInlineContent(block.text)}
              </h2>
            );

          case 'h3':
            return (
              <h3
                key={index}
                id={block.id}
                className="scroll-mt-28 font-serif text-xl sm:text-2xl font-medium text-ink mt-8 mb-3"
              >
                {renderInlineContent(block.text)}
              </h3>
            );

          case 'blockquote':
            return (
              <blockquote
                key={index}
                className="border-l-4 border-[#D99B26] bg-cream/40 rounded-r-2xl py-3 px-5 italic text-ink/80 my-6 leading-relaxed"
              >
                {renderInlineContent(block.text)}
              </blockquote>
            );

          case 'bullet-list':
            return (
              <ul key={index} className="list-disc list-outside ml-5 space-y-2.5 my-4 text-ink/80 leading-relaxed">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx}>{renderInlineContent(item)}</li>
                ))}
              </ul>
            );

          case 'numbered-list':
            return (
              <ol key={index} className="list-decimal list-outside ml-5 space-y-2.5 my-4 text-ink/80 leading-relaxed">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx}>{renderInlineContent(item)}</li>
                ))}
              </ol>
            );

          case 'hr':
            return <hr key={index} className="my-8 border-ink/10" />;

          case 'image':
            return (
              <figure
                key={index}
                className="my-8 overflow-hidden rounded-2xl border border-ink/10 shadow-xs bg-[#FAF8F5]/60 flex flex-col items-center"
              >
                <Image
                  src={block.src}
                  alt={block.alt || 'Article visual'}
                  width={1200}
                  height={800}
                  unoptimized
                  className="max-h-[520px] w-auto max-w-full object-contain rounded-xl"
                />
                {block.alt && (
                  <figcaption className="w-full text-xs text-center text-ink/50 py-2.5 bg-cream/30 italic">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );

          case 'paragraph':
            return (
              <p key={index} className="text-ink/80 text-base sm:text-lg leading-relaxed mb-6 font-light">
                {renderInlineContent(block.text)}
              </p>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
