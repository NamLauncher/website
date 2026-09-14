import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

// Author/creator: nattapat2871 (https://nattapat2871.me)

const websiteApp = await readFile(new URL('../static/assets/app.js', import.meta.url), 'utf8')
const websiteCss = await readFile(new URL('../static/assets/styles.css', import.meta.url), 'utf8')
const websiteHtml = await readFile(new URL('../static/index.html', import.meta.url), 'utf8')

test('uses AME likes as cumulative downloads and records clicks through the protected backend', () => {
  const renderPageStats = websiteApp.slice(
    websiteApp.indexOf('function renderPageStats'),
    websiteApp.indexOf('async function loadStats')
  )
  assert.match(renderPageStats, /pageViewsCount/)
  assert.match(renderPageStats, /downloadsCount/)
  assert.match(renderPageStats, /stats\.like_count/)
  assert.match(websiteApp, /fetch\("\/api\/downloads"/)
  assert.doesNotMatch(websiteApp, /AME_API_BASE\}\/api\/like/)
  assert.doesNotMatch(websiteApp, /DOWNLOAD_COOLDOWN_MS/)
  assert.match(websiteApp, /function refreshLiveNumbers\(\{ recordView = false \} = \{\}\) \{/)
  assert.match(websiteApp, /refreshLiveNumbers\(\{ recordView: true \}\)/)
})

test('prevents website artwork drag and avoids disabled-button busy cursors', () => {
  assert.match(websiteCss, /-webkit-user-drag: none/)
  assert.match(websiteCss, /button:disabled,[\s\S]*cursor: default !important/)
})

test('keeps website motion visible in reduced-motion and performance-focused environments', () => {
  assert.match(websiteCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration: 260ms !important/)
  assert.match(websiteCss, /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 160ms !important/)
  assert.match(websiteCss, /\.motion-ready \[data-motion\][\s\S]*translate3d\(0, 8px, 0\)/)
  assert.match(websiteCss, /\[data-motion-critical="true"\]:not\(\.is-visible\)[\s\S]*opacity: 1/)
  assert.match(websiteApp, /target\.dataset\.motionCritical = "true"/)
  assert.match(websiteApp, /function isNearViewport\(element, margin = 48\)/)
  assert.match(websiteApp, /window\.requestAnimationFrame\(revealInitialViewport\)/)
  assert.match(websiteApp, /window\.setTimeout\(revealCriticalTargets, 900\)/)
  assert.match(websiteApp, /window\.scrollTo\(\{ top: 0, behavior: "smooth" \}\)/)
  assert.doesNotMatch(websiteCss, /animation-duration: 0\.01ms !important/)
})

test('keeps mobile website text and header within the viewport', () => {
  assert.match(websiteCss, /\.site-header \{[\s\S]*max-width: 100vw/)
  assert.match(websiteCss, /@media \(max-width: 680px\)[\s\S]*h1 \{[\s\S]*overflow-wrap: anywhere/)
  assert.match(websiteCss, /@media \(max-width: 680px\)[\s\S]*\.hero-actions \{[\s\S]*width: 100%[\s\S]*flex-direction: column/)
  assert.match(websiteCss, /@media \(max-width: 460px\)[\s\S]*\.brand > span:not\(\.beta-pill\) \{[\s\S]*display: none/)
  assert.match(websiteCss, /@media \(max-width: 680px\)[\s\S]*\.history-hero h1 \{[\s\S]*overflow-wrap: anywhere/)
})

test('shows MiniSand Online as a partner server on the website', () => {
  assert.match(websiteHtml, /class="[^"]*partner-card[^"]*minisand-partner[^"]*"/)
  assert.match(websiteHtml, /href="https:\/\/minisand\.online\/"/)
  assert.match(websiteHtml, /src="\/assets\/minisand-logo\.png"/)
  assert.match(websiteApp, /"partner\.minisand\.title": "MiniSand Online"/)
  assert.match(websiteApp, /"partner\.open": "เข้าเว็บเซิร์ฟเวอร์"/)
  assert.match(websiteCss, /\.partner-card:hover,[\s\S]*border-color: color-mix\(in oklab, var\(--accent\)/)
  assert.match(websiteCss, /@media \(max-width: 920px\)[\s\S]*\.partner-grid \{ grid-template-columns: 1fr; \}/)
})
