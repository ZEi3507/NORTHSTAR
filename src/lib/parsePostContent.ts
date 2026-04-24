export interface ParsedEntry {
  publicContent: string;    // full text with [REDACTED] placeholder where tags were
  redactedContent: string;  // extracted segments joined by \n---\n
  wordCount: number;        // computed on FULL raw content including redacted text
}

export function parsePostContent(rawContent: string): ParsedEntry {
  const redactRegex = /\[redact\]([\s\S]*?)\[\/redact\]/g;
  const segments: string[] = [];

  // Replace each block in the original string with the literal text "[REDACTED]"
  const publicContent = rawContent.replace(redactRegex, (_, inner) => {
    segments.push(inner.trim());
    return '[REDACTED]';
  });

  // Word count: strip the [redact] and [/redact] tags from rawContent,
  // then split on whitespace and count non-empty tokens
  const wordCount = rawContent
    .replace(/\[redact\]|\[\/redact\]/g, '')
    .split(/\s+/)
    .filter(segment => segment.length > 0)
    .length;

  return {
    publicContent: publicContent.trim(),
    redactedContent: segments.join('\n---\n'),
    wordCount,
  };
}
