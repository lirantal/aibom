const CONTROL_CHARS_RGXP = /[\x00-\x1F\x7F-\x9F]/g;
const ZERO_WIDTH_CHARS_RGXP = /[\u200B-\u200D\uFEFF]/g;
const BIDI_OVERRIDE_CHARS_RGXP = /[\u202A-\u202E\u2066-\u2069]/g;
const UNICODE_SEPARATORS_RGXP = /[\u2028\u2029]/g;
const HTML_TAGS_RGXP = /<[^>]*>/g;
const DANGEROUS_PROTOCOLS_RGXP = /\b(?:javascript|data|vbscript):/gi;
const EVENT_HANDLER_RGXP = /\bon\w+\s*=/gi;
const SQL_COMMENT_RGXP = /(--|\/\*|\*\/)/g;
const PATH_TRAVERSAL_RGXP = /\.\.\//g;
const SHELL_META_RGXP = /[;&|`$<>]/g;
const MULTI_SPACE_RGXP = /\s+/g;

/**
 * Sanitizes text for safe display by removing:
 * - control characters
 * - invisible Unicode spoofing characters
 * - directional override characters (Trojan Source)
 * - HTML tags
 * - dangerous URI protocols
 * - shell / SQL / path injection patterns
 */
export function sanitizeDisplayText(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(CONTROL_CHARS_RGXP, "")
    .replace(ZERO_WIDTH_CHARS_RGXP, "")
    .replace(BIDI_OVERRIDE_CHARS_RGXP, "")
    .replace(UNICODE_SEPARATORS_RGXP, "")
    .replace(HTML_TAGS_RGXP, "")
    .replace(DANGEROUS_PROTOCOLS_RGXP, "")
    .replace(EVENT_HANDLER_RGXP, "")
    .replace(SQL_COMMENT_RGXP, "")
    .replace(PATH_TRAVERSAL_RGXP, "")
    .replace(SHELL_META_RGXP, "")
    .replace(MULTI_SPACE_RGXP, " ")
    .trim()
    .slice(0, 500);
}
/**
 * Sanitizes and truncates text for canvas label display.
 * Ensures the text is safe and fits within display constraints.
 */
export function sanitizeCanvasLabel(
  label: string,
  maxLength: number = 18,
): string {
  const sanitized = sanitizeDisplayText(label);

  if (!sanitized.length) {
    return "[unnamed]";
  }

  if (sanitized.length > maxLength) {
    return sanitized.slice(0, maxLength - 2) + "..";
  }

  return sanitized;
}
