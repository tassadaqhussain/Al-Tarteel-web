import React from 'react';

/**
 * Wraps matched substrings in <mark> elements for search result highlighting.
 * Case-insensitive, handles Arabic and Latin text.
 */
export function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) return text;

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="rounded bg-gold-500/20 text-gold-500 not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
