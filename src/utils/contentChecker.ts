import BLOCKED_WORDS from "../config/blockedWords";
import DOMPurify from "dompurify";

export function containsInappropriateContent(text: string): boolean {
  if (!text) return false;

  // Konvertiere Text zu Kleinbuchstaben für case-insensitive Prüfung
  const lowerText = text.toLowerCase();

  // Prüfe auf blockierte Wörter
  return BLOCKED_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
}

export function sanitizeContent(content: string): string {
  if (!content) return "";

  // Entferne alle HTML-Tags
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // Keine HTML-Tags erlauben
    ALLOWED_ATTR: [], // Keine Attribute erlauben
  });

  // Entferne potenzielle JavaScript-Protokoll-Links
  const noJavaScriptProtocol = sanitizedContent.replace(
    /javascript:/gi,
    "blocked:"
  );

  // Entferne potenzielle data:-URLs
  const noDataUrls = noJavaScriptProtocol.replace(/data:/gi, "blocked:");

  // Escape spezielle Zeichen
  const escapedContent = escapeSpecialCharacters(noDataUrls);

  return escapedContent;
}

function escapeSpecialCharacters(text: string): string {
  const htmlEntities: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return text.replace(/[&<>"'`=\/]/g, (char) => htmlEntities[char]);
}

export function validateInput(input: string): {
  isValid: boolean;
  sanitizedContent: string;
  error?: string;
} {
  if (!input) {
    return { isValid: false, sanitizedContent: "", error: "Input is empty" };
  }

  // Prüfe auf unangemessene Inhalte
  if (containsInappropriateContent(input)) {
    return {
      isValid: false,
      sanitizedContent: "",
      error: "Content contains inappropriate language",
    };
  }

  // Prüfe auf maximale Länge (z.B. 1000 Zeichen)
  if (input.length > 1000) {
    return {
      isValid: false,
      sanitizedContent: "",
      error: "Content exceeds maximum length",
    };
  }

  // Prüfe auf verdächtige Patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i,
    /onmouseover=/i,
    /eval\(/i,
    /document\./i,
    /window\./i,
  ];

  if (suspiciousPatterns.some((pattern) => pattern.test(input))) {
    return {
      isValid: false,
      sanitizedContent: "",
      error: "Content contains suspicious patterns",
    };
  }

  // Sanitize den Input
  const sanitizedContent = sanitizeContent(input);

  return {
    isValid: true,
    sanitizedContent,
  };
}

// Helfer-Funktion für die Verwendung in Forms
export function validateAndSanitizeForm(formData: Record<string, string>): {
  isValid: boolean;
  sanitizedData: Record<string, string>;
  errors: Record<string, string>;
} {
  const result = {
    isValid: true,
    sanitizedData: {} as Record<string, string>,
    errors: {} as Record<string, string>,
  };

  for (const [key, value] of Object.entries(formData)) {
    const validation = validateInput(value);

    if (!validation.isValid) {
      result.isValid = false;
      result.errors[key] = validation.error || "Invalid input";
    }

    result.sanitizedData[key] = validation.sanitizedContent;
  }

  return result;
}
