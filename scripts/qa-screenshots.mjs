// Screenshots against a running preview server (local QA only; Playwright is pre-installed globally).
// Usage: BASE_URL=http://localhost:4173 node scripts/qa-screenshots.mjs
// Output: qa/<device>-full.png, qa/<device>-<section>.png, qa/iphone-14-state-*.png
import { createRequire } from 'node:module'
const { chromium, devices } = createRequire(import.meta.url)('playwright')
import { mkdirSync } from 'node:fs'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173'
const out = 'qa'
mkdirSync(out, { recursive: true })

const SECTIONS = ['cover', 'greeting', 'family', 'calendar', 'gallery', 'location', 'account', 'rsvp', 'guestbook', 'share', 'footer']
const targets = [
  { name: 'iphone-14', device: devices['iPhone 14'], sections: true, states: true },
  { name: 'galaxy-s9', device: devices['Galaxy S9+'], sections: false, states: false },
  { name: 'desktop', device: { viewport: { width: 1280, height: 900 } }, sections: false, states: false },
]

const browser = await chromium.launch()
const errors = []
const warnings = []
const isExternal = (text) => /https?:\/\/(cdn\.jsdelivr\.net|fonts\.g(oogleapis|static)\.com|t1\.kakaocdn\.net|dapi\.kakao\.com)/.test(text) || /ERR_TUNNEL_CONNECTION_FAILED|ERR_NAME_NOT_RESOLVED/.test(text)

for (const t of targets) {
  const ctx = await browser.newContext({ ...t.device, locale: 'ko-KR', timezoneId: 'Asia/Seoul' })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`[${t.name}] pageerror: ${e.message}`))
  page.on('requestfailed', (r) => (isExternal(r.url()) ? warnings : errors).push(`[${t.name}] requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    if (/Failed to load resource/.test(text)) return // reported via requestfailed with the URL
    ;(isExternal(text) ? warnings : errors).push(`[${t.name}] console.error: ${text}`)
  })
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  const h = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < h; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y)
    await page.waitForTimeout(100)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  const hasHScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (hasHScroll) errors.push(`[${t.name}] horizontal overflow detected`)
  await page.screenshot({ path: `${out}/${t.name}-full.png`, fullPage: true })

  if (t.sections) {
    for (const id of SECTIONS) {
      const el = page.locator(`#${id}`).first()
      if ((await el.count()) === 0) { warnings.push(`[${t.name}] section #${id} not found`); continue }
      await el.scrollIntoViewIfNeeded()
      await page.waitForTimeout(700)
      await el.screenshot({ path: `${out}/${t.name}-${id}.png` })
    }
  }
  if (t.states) {
    // contact sheet
    const contact = page.getByRole('button', { name: /연락하기/ }).first()
    if (await contact.count()) {
      await contact.scrollIntoViewIfNeeded(); await contact.click(); await page.waitForTimeout(700)
      await page.screenshot({ path: `${out}/${t.name}-state-contact.png` })
      await page.keyboard.press('Escape'); await page.waitForTimeout(500)
    }
    // account accordion
    const acc = page.getByRole('button', { name: /신랑측 계좌/ }).first()
    if (await acc.count()) {
      await acc.scrollIntoViewIfNeeded(); await acc.click(); await page.waitForTimeout(700)
      await page.locator('#account').screenshot({ path: `${out}/${t.name}-state-account-open.png` })
    }
    // gallery lightbox
    const tile = page.locator('#gallery button, #gallery a').first()
    if (await tile.count()) {
      await tile.scrollIntoViewIfNeeded(); await tile.click(); await page.waitForTimeout(1200)
      await page.screenshot({ path: `${out}/${t.name}-state-lightbox.png` })
      await page.keyboard.press('Escape'); await page.waitForTimeout(500)
    }
  }
  await ctx.close()
}
await browser.close()
if (warnings.length) console.warn(`warnings (external resources, ignored):\n${warnings.join('\n')}`)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log(`screenshots written to ${out}/`)
