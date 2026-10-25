// Renders public/og-image.png (1200x630) from the config using Playwright (pre-installed).
// Usage: node scripts/make-og.mjs   — bump ?v= in index.html afterwards (KakaoTalk caches by URL).
import { createRequire } from 'node:module'
const { chromium } = createRequire(import.meta.url)('playwright')
import { readFileSync, writeFileSync } from 'node:fs'

const cfg = readFileSync('src/config/wedding.ts', 'utf8')
const pick = (re, fallback) => (cfg.match(re) ?? [])[1] ?? fallback
const groom = pick(/groom:\s*\{\s*name:\s*'([^']+)'/, '신랑')
const bride = pick(/bride:\s*\{\s*name:\s*'([^']+)'/, '신부')
const venue = pick(/const venueName = '([^']+)'/, '')
const startsAt = pick(/const startsAt = '([^']+)'/, '')
const placeholder = /const datePlaceholder = true/.test(cfg)
// Same rule as src/config/wedding.ts: "YYYY년 OO월 OO일" until the date is confirmed, then the KST date.
const dateLine = (() => {
  if (!startsAt) return ''
  if (placeholder) return `${startsAt.slice(0, 4)}년 OO월 OO일`
  const d = new Date(new Date(startsAt).getTime() + 9 * 3600 * 1000)
  const w = ['일', '월', '화', '수', '목', '금', '토'][d.getUTCDay()]
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${w}요일`
})()
const desc = [dateLine, venue].filter(Boolean).join(' · ')
// Skip the venue line when the share description already names it.
const venueLine = venue && !desc.includes(venue) ? `${venueLine}` : ''

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400&family=Cormorant+Garamond:ital,wght@0,400;1,400;1,500&display=swap">
<style>
  html,body{margin:0;width:1200px;height:630px;background:radial-gradient(900px 500px at 20% 10%, #fbf1dc 0%, transparent 60%), radial-gradient(800px 500px at 85% 90%, #e9f0e3 0%, transparent 60%), #f9f7f0;color:#4a4a43;font-family:'Pretendard Variable',sans-serif}
  .wrap{position:relative;width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px}
  .frame{position:absolute;inset:28px;border:1px solid #e5e2d8;border-radius:16px}
  .eyebrow{font-family:'Cormorant Garamond',serif;font-style:italic;letter-spacing:.35em;font-size:22px;color:#ab4f23}
  .names{font-family:'Noto Serif KR',serif;font-weight:300;font-size:72px;letter-spacing:.04em}
  .names span{color:#9fb59c;font-size:40px;margin:0 22px;vertical-align:middle;font-family:'Cormorant Garamond',serif;font-style:italic}
  .desc{font-size:26px;color:#6f6c63}
  .venue{font-size:22px;color:#6f6c63;letter-spacing:.05em}
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
