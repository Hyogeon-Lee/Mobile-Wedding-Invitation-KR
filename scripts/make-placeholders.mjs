// Generates placeholder photos as SVG (no binary deps). Run: npm run placeholders
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const out = join(process.cwd(), 'public', 'images')
mkdirSync(out, { recursive: true })

const palettes = [
  ['#eef3ea', '#cfdccb'], // cool off-white / sage
  ['#e3f0e1', '#b9d8bd'], // pale green
  ['#f1f5ef', '#d6e3d4'], // white-green
  ['#e1ecee', '#bfd3d6'], // cool sky
  ['#e6f1e4', '#a9d4b4'], // fresh mint
  ['#edf4e6', '#c8dcb6'], // lime-white
]

function svg(w, h, label, [c1, c2]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.42}" r="${Math.min(w, h) * 0.16}" fill="rgba(255,255,255,0.35)"/>
  <text x="50%" y="${h * 0.78}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(w * 0.05)}" fill="rgba(60,50,45,0.6)" letter-spacing="4">${label}</text>
</svg>
`
}

writeFileSync(join(out, 'cover.svg'), svg(1200, 1600, 'MAIN PHOTO', palettes[0]))
const sizes = [
  [1200, 1500], [1200, 1500], [1200, 900],
  [1200, 1500], [1200, 1500], [1200, 900],
  [1200, 1500], [1200, 1500], [1200, 900],
  [1200, 1500], [1200, 1500], [1200, 900],
]
sizes.forEach(([w, h], i) => {
  const n = String(i + 1).padStart(2, '0')
  writeFileSync(join(out, `gallery-${n}.svg`), svg(w, h, `PHOTO ${i + 1}`, palettes[i % palettes.length]))
})
writeFileSync(join(out, 'map-fallback.svg'), svg(1200, 800, 'MAP (fallback)', palettes[3]))
console.log(`wrote ${sizes.length + 2} placeholder images to public/images`)
