import sanitizeHtml from "sanitize-html";

/**
 * Generic HTML sanitizer - broad tag/attribute allowlist.
 * Use for content where rich formatting including images is acceptable.
 */
export function sanitizeHTMLServer(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class", "style"],
    },
  });
}

/**
 * Plain-text sanitizer - strips ALL HTML tags.
 * Use for title and short-description fields where no markup is allowed.
 */
export function sanitizePlainText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

/**
 * Restricted rich-text sanitizer - allows only safe formatting tags.
 * Strips style attributes, scripts, and all event handlers (on*).
 * Use for description fields that accept basic formatting.
 */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ["p", "strong", "em", "ul", "ol", "li", "a", "h2", "h3", "br"],
    allowedAttributes: {
      a: ["href", "rel"],
    },
    // Ensure no event-handler or style attributes leak through
    allowedSchemes: ["https", "http", "mailto"],
  });
}
