import type { ParsedEntry } from './parsePostContent';

const MIN_WORD_COUNT = 150;

export function validateEntry(parsed: ParsedEntry): string | null {
  if (parsed.wordCount < MIN_WORD_COUNT) {
    return `Entries must be at least 150 words. Yours is currently ${parsed.wordCount}.`;
  }
  return null;
}
