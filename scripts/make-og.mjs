// Renders public/og-image.png (1200x630) from config/wedding.json with Playwright (not a dependency of this project).
// Usage: node scripts/make-og.mjs [--dry-run]. Bump ?v= in index.html afterwards (KakaoTalk caches by URL).
// --dry-run prints the text lines without launching a browser or writing the file.
// Needs Node 22.18+ or 23.6+ because it imports TypeScript sources from src/config.
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { shareDescriptionOf } from '../src/config/resolve.ts'
import { validateWedding } from '../src/config/validate.ts'

const cfg = validateWedding(JSON.parse(readFileSync('config/wedding.json', 'utf8')))
const groom = cfg.couple.groom.name
const bride = cfg.couple.bride.name
const venue = cfg.event.venueName
const desc = shareDescriptionOf(cfg)
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// Skip the venue line when the description already names it.
const venueLine = venue && !desc.includes(venue) ? `<div class="venue">${esc(venue)}</div>` : ''

if (process.argv.includes('--dry-run')) {
  console.log({ groom, bride, desc, venue: venueLine ? venue : '(in description)' })
  process.exit(0)
}

const { chromium } = createRequire(import.meta.url)('playwright')
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&display=swap">
<style>
  html,body{margin:0;width:1200px;height:630px;background:radial-gradient(900px 500px at 20% 10%, #f0f8ea 0%, transparent 60%), radial-gradient(800px 500px at 85% 90%, #e6f1f2 0%, transparent 60%), #f8fbf6;color:#36423b;font-family:'Pretendard Variable',sans-serif}
  .wrap{position:relative;width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px}
  .frame{position:absolute;inset:28px;border:1px solid #dbe5da;border-radius:16px}
  .eyebrow{font-family:'Cormorant Garamond',serif;font-style:italic;letter-spacing:.35em;font-size:22px;color:#377656}
  .names{font-family:'Noto Serif KR',serif;font-weight:300;font-size:72px;letter-spacing:.04em}
  .names span{color:#d9671f;font-size:40px;margin:0 22px;vertical-align:middle;font-family:'Cormorant Garamond',serif;font-style:italic}
  .desc{font-size:26px;color:#5f6f66}
  .venue{font-size:22px;color:#5f6f66;letter-spacing:.05em}
</style></head><body><div class="wrap"><div class="frame"></div>
<div class="eyebrow">${esc(cfg.cover.eyebrow || 'WEDDING INVITATION')}</div>
<div class="names">${esc(groom)}<span>&amp;</span>${esc(bride)}</div>
<div class="desc">${esc(desc)}</div>
${venueLine}
</div></body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
const png = await page.screenshot({ type: 'png' })
await browser.close()
writeFileSync('public/og-image.png', png)
console.log(`wrote public/og-image.png (${png.length} bytes)`)
