import raw from '../../config/wedding.json'
import { images } from 'virtual:content-images'
import { resolveWedding } from './resolve'
import { validateWedding } from './validate'

/** Site content from config/wedding.json (text) and config/images/ (photos, sized at build time by vite/content-images.ts) */
export const wedding = resolveWedding(validateWedding(raw), images)
