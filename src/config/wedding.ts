import raw from '../../config/wedding.json'
import { images } from 'virtual:content-images'
import { dateLineOf, resolveWedding } from './resolve'
import { validateWedding } from './validate'

/**
 * Site content comes from config/wedding.json (text) and config/images/ (photos, sized at build time by
 * vite/content-images.ts). Edit those files, not this one.
 */
export const wedding = resolveWedding(validateWedding(raw), images)

/** "2027년 OO월 OO일" until the date is confirmed, then the real date; shared by the Kakao card and index.html copy. */
export const dateLine = dateLineOf(wedding.event)

export default wedding
