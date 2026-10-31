'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isDeepMode?: boolean;
}

export function MarkdownRenderer({
  content,
  className = '',
  isDeepMode = false,
}: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div
      className={`markdown-sanctuary text-parchment-cream/90 leading-relaxed ${
        isDeepMode ? 'font-thai-serif' : 'font-thai'
      } ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-thai-serif font-black text-parchment-cream mt-10 mb-6 tracking-tight leading-tight"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl sm:text-3xl font-thai-serif font-bold text-parchment-cream mt-10 mb-4 pb-2.5 border-b border-emerald-border/40 tracking-tight leading-snug"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl sm:text-2xl font-thai-serif font-bold text-gold-light mt-8 mb-3 tracking-normal leading-snug"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg sm:text-xl font-thai-serif font-semibold text-gold-warm mt-6 mb-2.5"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="text-base sm:text-lg leading-relaxed text-parchment-cream/90 font-light mb-6 font-thai-serif text-balance"
              {...props}
            />
          ),
          hr: () => (
            <div className="my-10 relative flex items-center justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-warm/40 to-transparent" />
              <div className="absolute px-3 bg-[#08110D] text-gold-warm/60 text-xs font-serif tracking-widest">
                ✦ ✦ ✦
              </div>
            </div>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="my-7 p-6 rounded-2xl bg-emerald-card/70 border border-gold-warm/25 backdrop-blur-sm text-parchment-light italic text-base sm:text-lg leading-relaxed shadow-sm space-y-2"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-outside space-y-2.5 pl-6 mb-6 text-parchment-cream/90 marker:text-gold-warm text-base sm:text-lg leading-relaxed"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-outside space-y-2.5 pl-6 mb-6 text-parchment-cream/90 marker:text-gold-warm font-semibold text-base sm:text-lg leading-relaxed"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed pl-1.5 font-light" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-gold-light" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-parchment-light" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-gold-warm underline underline-offset-4 hover:text-gold-light transition duration-150 decoration-gold-warm/50 hover:decoration-gold-light"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8 rounded-2xl border border-emerald-border bg-[#0B1511]/80 shadow-md">
              <table className="w-full border-collapse text-left" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#12251D] border-b border-emerald-border/80" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-emerald-border/30" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-white/[0.02] transition-colors" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-5 py-3.5 text-xs sm:text-sm font-thai-serif font-bold text-gold-light tracking-wide uppercase"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-5 py-3 text-xs sm:text-sm text-parchment-cream/90 leading-relaxed"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }) => {
            const isInline = !className && typeof children === 'string' && !children.includes('\n');
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-black/50 border border-emerald-border/60 text-xs sm:text-sm font-mono text-gold-light"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => (
            <pre
              className="p-5 my-6 rounded-2xl bg-black/60 border border-emerald-border/80 overflow-x-auto text-xs sm:text-sm font-mono text-parchment-muted leading-relaxed shadow-inner"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <span className="block my-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="rounded-2xl border border-gold-warm/30 shadow-lg mx-auto max-h-[480px] object-cover"
                loading="lazy"
                alt={props.alt || 'Safe Soul Illustration'}
                {...props}
              />
              {props.alt && (
                <span className="block mt-2 text-xs text-parchment-muted/80 italic font-light">
                  {props.alt}
                </span>
              )}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
