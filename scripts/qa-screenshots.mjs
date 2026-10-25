// Full-page screenshots on phone viewports against a running dev/preview server.
// Usage: BASE_URL=http://localhost:4173 node scripts/qa-screenshots.mjs
import { createRequire } from 'node:module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')
import { mkdirSync } from 'node:fs'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173'
const out = 'qa'
mkdirSync(out, { recursive: true })

const targets = [
  { name: 'iphone-14', device: devices['iPhone 14'] },
  { name: 'galaxy-s9', device: devices['Galaxy S9+'] },
  { name: 'desktop', device: { viewport: { width: 1280, height: 900 } } },
]

const browser = await chromium.launch()
const errors = []
for (const t of targets) {
  const ctx = await browser.newContext({ ...t.device, locale: 'ko-KR', timezoneId: 'Asia/Seoul' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`[${t.name}] pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${t.name}] console.error: ${m.text()}`)
  })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  // scroll through to trigger whileInView reveals and lazy images
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(120)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (hasHScroll) errors.push(`[${t.name}] horizontal overflow detected`)
  await page.screenshot({ path: `${out}/${t.name}-full.png`, fullPage: true })
  await ctx.close()
}
await browser.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`screenshots written to ${out}/`)
