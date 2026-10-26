/**
 * Splits body text into paragraphs of lines. Blank (or whitespace-only) lines end a paragraph;
 * consecutive non-empty lines stay together for a single <br> between them.
 */
export function splitParagraphs(body: string): string[][] {
  const paragraphs: string[][] = []
  let current: string[] = []
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    if (line === '') {
      if (current.length > 0) {
        paragraphs.push(current)
        current = []
      }
      continue
    }
    current.push(line)
  }
  if (current.length > 0) paragraphs.push(current)
  return paragraphs
}
