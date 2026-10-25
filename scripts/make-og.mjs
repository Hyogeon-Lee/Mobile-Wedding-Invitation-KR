// Renders public/og-image.png (1200x630) from the config using Playwright (pre-installed).
// Usage: node scripts/make-og.mjs   — bump ?v= in index.html afterwards (KakaoTalk caches by URL).
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import { readFileSync, writeFileSync } from 'node:fs'

const cfg = readFileSync('src/config/wedding.ts', 'utf8')
const pick = (re, fallback) => (cfg.match(re) ?? [])[1] ?? fallback
const groom = pick(/groom:\s*\{\s*name:\s*'([^']+)'/, '신랑')
const bride = pick(/bride:\s*\{\s*name:\s*'([^']+)'/, '신부')
const venue = pick(/venueName:\s*'([^']+)'/, '')
const desc = pick(/description:\s*'([^']+)'/, '')
// Skip the venue line when the share description already names it.
const venueLine = venue && !desc.includes(venue) ? `${venueLine}` : ''

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Cormorant+Garamond:wght@400;500&display=swap">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#fbf9f4;color:#2b2a28;font-family:'Pretendard Variable',sans-serif}
  .wrap{position:relative;width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px}
  .frame{position:absolute;inset:28px;border:1px solid #e6e1d8}
  .eyebrow{font-family:'Cormorant Garamond',serif;letter-spacing:.4em;font-size:22px;color:#a9636b}
  .names{font-family:'Gowun Batang',serif;font-size:72px;letter-spacing:.02em}
  .names span{color:#a9636b;font-size:40px;margin:0 22px;vertical-align:middle}
  .desc{font-size:26px;color:#6f6a63}
  .venue{font-size:22px;color:#6f6a63;letter-spacing:.05em}
</style></head><body><div class="wrap"><div class="frame"></div>
<div class="eyebrow">WEDDING INVITATION</div>
<div class="names">${groom}<span>&</span>${bride}</div>
<div class="desc">${desc}</div>
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
