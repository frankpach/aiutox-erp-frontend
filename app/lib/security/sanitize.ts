/**
 * Input sanitization utilities
 * 
 * Provides functions to sanitize user inputs and prevent XSS attacks
 * Following OWASP guidelines for input validation
 */

/**
 * Sanitize a string by removing potentially dangerous characters
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: URLs that could be used for XSS
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize an email address
 * 
 * @param email - Email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") {
    return "";
  }

  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Remove dangerous characters but keep valid email format
  let sanitized = email.trim().toLowerCase();
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, "");
  
  // Validate email format
  if (!emailPattern.test(sanitized)) {
    return "";
  }

  return sanitized;
}

/**
 * Sanitize a URL
 * 
 * @param url - URL to sanitize
 * @param allowedProtocols - Array of allowed protocols (default: ['http', 'https'])
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(
  url: string,
  allowedProtocols: string[] = ["http", "https"]
): string {
  if (typeof url !== "string") {
    return "";
  }

  let sanitized = url.trim();

  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/^(javascript|data|vbscript):/i, "");

  // Check if URL starts with allowed protocol
  const hasAllowedProtocol = allowedProtocols.some((protocol) =>
    sanitized.toLowerCase().startsWith(`${protocol}:`)
  );

  if (!hasAllowedProtocol && !sanitized.startsWith("/") && !sanitized.startsWith("#")) {
    // If no protocol and not relative, prepend https://
    sanitized = `https://${sanitized}`;
  }

  try {
    // Validate URL
    const urlObj = new URL(sanitized);
    
    // Check protocol is allowed
    if (!allowedProtocols.includes(urlObj.protocol.replace(":", ""))) {
      return "";
    }

    return sanitized;
  } catch {
    // If URL parsing fails, return empty string
    return "";
  }
}

/**
 * Sanitize HTML content (basic)
 * 
 * WARNING: This is a basic sanitizer. For production, use a library like DOMPurify
 * 
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") {
    return "";
  }

  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");

  // Remove javascript: in attributes
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: URLs
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  return sanitized;
}

/**
 * Sanitize a phone number
 * 
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number (only digits, +, -, spaces, parentheses)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") {
    return "";
  }

  // Keep only digits, +, -, spaces, and parentheses
  return phone.replace(/[^\d+\-()\s]/g, "").trim();
}

/**
 * Sanitize a number input
 * 
 * @param input - Number string to sanitize
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @returns Sanitized number or NaN if invalid
 */
export function sanitizeNumber(
  input: string | number,
  min?: number,
  max?: number
): number {
  const num = typeof input === "string" ? parseFloat(input) : input;

  if (isNaN(num)) {
    return NaN;
  }

  if (min !== undefined && num < min) {
    return NaN;
  }

  if (max !== undefined && num > max) {
    return NaN;
  }

  return num;
}

/**
 * Sanitize an object recursively
 * 
 * @param obj - Object to sanitize
 * @param deep - Whether to sanitize nested objects (default: true)
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  deep: boolean = true
): T {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  const sanitized = { ...obj } as T;

  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const value = sanitized[key];

      if (typeof value === "string") {
        // Sanitize string values
        (sanitized as Record<string, unknown>)[key] = sanitizeString(value);
      } else if (deep && typeof value === "object" && value !== null) {
        // Recursively sanitize nested objects
        (sanitized as Record<string, unknown>)[key] = sanitizeObject(
          value as Record<string, unknown>,
          deep
        );
      }
    }
  }

  return sanitized;
}
