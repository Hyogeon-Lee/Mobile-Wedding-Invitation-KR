import { describe, expect, it } from 'vitest'
import { splitParagraphs } from './paragraphs'

describe('splitParagraphs', () => {
  it('groups consecutive lines and splits on empty lines', () => {
    expect(splitParagraphs('a\nb\n\nc')).toEqual([['a', 'b'], ['c']])
  })
  it('collapses repeated blank lines and whitespace-only lines', () => {
    expect(splitParagraphs('a\n\n\n  \nb')).toEqual([['a'], ['b']])
  })
  it('ignores leading and trailing blank lines', () => {
    expect(splitParagraphs('\n\na\nb\n\n')).toEqual([['a', 'b']])
  })
  it('returns no paragraphs for empty input', () => {
    expect(splitParagraphs('')).toEqual([])
    expect(splitParagraphs('\n \n')).toEqual([])
  })
  it('trims surrounding whitespace on each line', () => {
    expect(splitParagraphs('  a  \n b ')).toEqual([['a', 'b']])
  })
})
