import DOMPurify from "isomorphic-dompurify";


const STRICT_CONFIG = { ALLOWED_TAGS: [] as string[], ALLOWED_ATTR: [] as string[] };
const BASIC_CONFIG = { ALLOWED_TAGS: ["b", "i", "em", "strong", "br"], ALLOWED_ATTR: [] as string[] };


export function sanitizeStrict(input: string): string {
  return DOMPurify.sanitize(input, STRICT_CONFIG);
}


export function sanitizeBasic(input: string): string {
  return DOMPurify.sanitize(input, BASIC_CONFIG);
}


export function sanitizeDisplayName(name: string): string {
  const noHtml = sanitizeStrict(name);
  const cleaned = noHtml.replace(/[^a-zA-Z\s'.,\-]/g, "").trim();
  return cleaned.slice(0, 50);
}


export function sanitizeBio(bio: string): string {
  const sanitized = DOMPurify.sanitize(bio, BASIC_CONFIG);
  return sanitized.slice(0, 500);
}


export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, "").slice(0, 15);
}


export function sanitizeProfileData(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      const isLargeTextField = ["bio", "aboutFamily", "expectations"].includes(key);
      const maxLength = isLargeTextField ? 2000 : 255;
      result[key] = sanitizeStrict(value).slice(0, maxLength);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "string" ? sanitizeStrict(item).slice(0, 255) : item
      );
    } else if (value && typeof value === "object") {
      result[key] = sanitizeProfileData(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}



