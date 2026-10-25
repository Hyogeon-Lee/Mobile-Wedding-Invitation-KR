/**
 * Split greeting body text into paragraphs.
 *
 * Lines are separated by "\n". One or more empty (or whitespace-only) lines end a
 * paragraph; consecutive non-empty lines stay together so the renderer can place a
 * single <br> between them. Leading/trailing blank lines produce no empty paragraphs.
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
