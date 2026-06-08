/**
 * Input sanitization utilities to prevent prompt injection and XSS
 */

// Remove control characters and limit length
export function sanitizeText(input: string, maxLength = 10000): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .replace(/[<>]/g, '') // Remove angle brackets (basic XSS prevention)
    .slice(0, maxLength);
}

// Sanitize for AI prompts - remove instruction-like patterns
export function sanitizeForPrompt(input: string): string {
  const sanitized = sanitizeText(input, 50000);
  
  // Remove common prompt injection patterns
  return sanitized
    .replace(/ignore\s+previous\s+instructions/gi, '[REMOVED]')
    .replace(/ignore\s+above/gi, '[REMOVED]')
    .replace(/system\s*:\s*/gi, '[REMOVED]')
    .replace(/user\s*:\s*/gi, '[REMOVED]')
    .replace(/assistant\s*:\s*/gi, '[REMOVED]')
    .replace(/you\s+are\s+now/gi, '[REMOVED]')
    .replace(/new\s+instructions?/gi, '[REMOVED]')
    .replace(/override\s+prompt/gi, '[REMOVED]');
}

// Validate file type
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// Sanitize file name
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
}

// Safe JSON parse with fallback
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
