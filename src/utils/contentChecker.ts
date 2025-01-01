import { BLOCKED_WORDS } from "../config/blockedWords";

export function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => lowerText.includes(word.toLowerCase()));
}
