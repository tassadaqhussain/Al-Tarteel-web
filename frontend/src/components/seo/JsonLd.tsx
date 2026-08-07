type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function safeJsonLd(data: JsonLdProps['data']): string {
  // Prevent </script> breakouts in serialized JSON-LD.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Server-safe JSON-LD script for Google rich results. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
