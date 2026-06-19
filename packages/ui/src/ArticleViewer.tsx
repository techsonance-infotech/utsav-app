import React from "react";

interface ArticleViewerProps {
  content: string;
}

/**
 * Sanitize HTML content by removing dangerous tags and event handler attributes.
 * This is a lightweight server-safe sanitizer. For full-spec sanitization,
 * integrate DOMPurify on the client side.
 */
function sanitizeHtml(html: string): string {
  // Remove script, iframe, object, embed, form tags
  let safe = html.replace(/<\s*\/?\s*(script|iframe|object|embed|form|link|meta)\b[^>]*>/gi, "");
  // Remove on* event handlers (onclick, onerror, onload, etc.)
  safe = safe.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  // Remove javascript: protocol in href/src attributes
  safe = safe.replace(/(href|src)\s*=\s*["']?\s*javascript\s*:/gi, '$1="');
  // Remove data: protocol in src attributes (except images)
  safe = safe.replace(/src\s*=\s*["']?\s*data\s*:(?!image\/)/gi, 'src="');
  return safe;
}

export function ArticleViewer({ content }: ArticleViewerProps) {
  if (!content) {
    return <div className="text-neutral-500 italic text-xs">No content available.</div>;
  }

  const sanitized = sanitizeHtml(content);

  return (
    <div
      className="prose prose-invert max-w-none text-neutral-300 text-sm leading-relaxed space-y-4"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
