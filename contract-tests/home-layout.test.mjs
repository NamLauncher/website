// Author/creator: nattapat2871 (https://nattapat2871.me)
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const home = await readFile(new URL('../static/index.html', import.meta.url), 'utf8')
const app = await readFile(new URL('../static/assets/app.js', import.meta.url), 'utf8')
const css = await readFile(new URL('../static/assets/styles.css', import.meta.url), 'utf8')
const install = await readFile(new URL('../static/how-to-install.html', import.meta.url), 'utf8')
const changelog = await readFile(new URL('../static/changelog.html', import.meta.url), 'utf8')
const legal = await readFile(new URL('../static/legal.html', import.meta.url), 'utf8')
const discord = await readFile(new URL('../static/discord.html', import.meta.url), 'utf8')

test('uses a compact essential navigation with icons', () => {
  const nav = home.slice(home.indexOf('<nav id="site-nav"'), home.indexOf('</nav>'))
  assert.equal((nav.match(/<a /g) || []).length, 6)
  assert.equal((nav.match(/class="nav-icon"/g) || []).length, 6)
  assert.doesNotMatch(nav, /#instances|#developer|Main Site/)
})

test('reveals the brand after the hero without overlapping navigation', () => {
  assert.match(home, /class="site-header is-hero"/)
  assert.match(home, /data-header-expansion-sentinel/)
  assert.match(app, /function setupHeaderExpansionObserver\(\)/)
  assert.match(app, /headerExpansionObserver = new IntersectionObserver/)
  assert.match(css, /\.site-header\.is-hero \{[\s\S]*width: min\(820px/)
  assert.match(css, /\.site-header\.is-hero \.brand \{[\s\S]*max-width: 0/)
})

test('places ATLauncher directly beside Prism in a six-card comparison', () => {
  const comparison = home.slice(home.indexOf('<div class="comparison-grid">'), home.indexOf('class="comparison-note"'))
  assert.equal((comparison.match(/class="compare-card/g) || []).length, 6)
  const prism = comparison.indexOf('Prism Launcher')
  const atlauncher = comparison.indexOf('ATLauncher')
  assert.ok(prism >= 0 && atlauncher > prism)
  assert.equal((comparison.slice(prism, atlauncher).match(/class="compare-card/g) || []).length, 1)
  assert.match(app, /"comparison\.atlauncher\.title"/)
  assert.match(comparison, /assets\/brands\/atlauncher-packs\.webp/)
  assert.match(css, /brands\/atlauncher\.svg/)
  assert.doesNotMatch(css, /compare-card--atlauncher[\s\S]*?width:\s*42%/)
})

test('shows only partner servers in the requested order', () => {
  assert.doesNotMatch(home, /class="[^\"]*(creator-card|activity-card)/)
  const partners = home.slice(home.indexOf('<section id="partners"'), home.indexOf('</section>', home.indexOf('<section id="partners"')))
  assert.ok(partners.indexOf('minisand-partner') < partners.indexOf('teddyblock-partner'))
  assert.ok(partners.indexOf('teddyblock-partner') < partners.indexOf('namcraft-partner'))
})

test('download menus hide their tooltip and explain an empty release', () => {
  assert.match(css, /\.download-picker\.is-open \.download-menu-toggle::after/)
  assert.match(css, /\.download-menu-empty/)
  assert.match(app, /empty\.textContent = t\("actions\.noDownloads"\)/)
  assert.match(app, /"actions\.noDownloads": "ขณะนี้ไม่มีไฟล์ดาวน์โหลด"/)
})

test('pauses decorative animation offscreen and avoids scroll-time header measurement', () => {
  assert.match(app, /function setupAmbientMotion\(\)/)
  assert.match(css, /\.section:not\(\.is-ambient-active\)/)
  assert.match(css, /\.section,[\s\S]*?content-visibility:\s*auto/)
  assert.match(css, /body::before \{[\s\S]*?position:\s*absolute/)
  const headerCss = css.slice(css.indexOf('.site-header {'), css.indexOf('.site-header.is-hero'))
  const floatingControlsCss = css.slice(css.indexOf('.view-badge,\n.back-to-top {'), css.indexOf('.view-badge {', css.indexOf('.view-badge,\n.back-to-top {')))
  assert.doesNotMatch(headerCss, /backdrop-filter:/)
  assert.doesNotMatch(floatingControlsCss, /backdrop-filter:/)
  assert.match(app, /typeof IntersectionObserver === "undefined"\) \{[\s\S]*?updateHeaderExpansion\(\)/)
  const scrollHandler = app.slice(app.indexOf('window.addEventListener("scroll"'), app.indexOf('window.addEventListener("hashchange"'))
  assert.doesNotMatch(scrollHandler, /setupHeaderExpansionObserver\(\)/)
  assert.match(scrollHandler, /if \(!headerExpansionObserver\) updateHeaderExpansion\(\)/)
})

test('removes the synthetic instances mock-up and keeps real screenshots', () => {
  assert.doesNotMatch(home, /<section id="instances"/)
  assert.match(home, /<section id="screenshots"/)
  assert.match(home, /namlauncher-gallery-instance-content\.png/)
})

test('adds the real NameMC skin library screen to the launcher gallery', async () => {
  const screenshots = home.slice(home.indexOf('<section id="screenshots"'), home.indexOf('</section>', home.indexOf('<section id="screenshots"')))
  assert.equal((screenshots.match(/class="screenshot-frame/g) || []).length, 9)
  assert.match(screenshots, /namlauncher-gallery-skin-library\.png\?v=gallery-20260915/)
  assert.match(screenshots, /data-i18n="screenshots\.skinLibrary\.title"/)
  assert.match(app, /"screenshots\.skinLibrary\.open"/)
  await access(new URL('../static/assets/namlauncher-gallery-skin-library.png', import.meta.url))
})

test('keeps the local ATLauncher comparison artwork available', async () => {
  await access(new URL('../static/assets/brands/atlauncher-packs.webp', import.meta.url))
  await access(new URL('../static/assets/brands/atlauncher.svg', import.meta.url))
})

test('places release trust immediately after features and uses one maintainer card', () => {
  const featuresEnd = home.indexOf('</section>', home.indexOf('<section id="features"'))
  const signingStart = home.indexOf('<section id="code-signing-policy"')
  const loadersStart = home.indexOf('<section id="loaders"')
  assert.ok(featuresEnd < signingStart && signingStart < loadersStart)
  assert.match(home, /signing-policy-roles signing-policy-roles--single/)
})

test('uses the new full-width multi-column footer', () => {
  assert.match(home, /class="footer-inner"/)
  assert.equal((home.match(/class="footer-column"/g) || []).length, 3)
  assert.match(home, /class="footer-bottom"/)
  assert.match(home, /class="button button--primary footer-discord"/)
  assert.match(css, /\.site-footer \{[\s\S]*width: 100%/)
})

test('renders one shared header and footer contract on every public page', () => {
  assert.match(app, /function renderSharedChrome\(\)/)
  assert.match(app, /renderSharedChrome\(\);[\s\S]*const elements =/)
  for (const href of ['/#features', '/#compare', '/changelog', '/#download', '/how-to-install', '/legal']) {
    assert.match(app, new RegExp(`href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`))
  }
  for (const page of [home, install, changelog, legal]) {
    assert.match(page, /class="site-header/)
    assert.match(page, /class="site-footer/)
    assert.match(page, /\/assets\/app\.js/)
  }
})

test('keeps /discord as a redirect-only short link with no community page', () => {
  assert.match(discord, /http-equiv="refresh"/)
  assert.match(discord, /content="0;url=\/discord\/join"/)
  assert.match(discord, /window\.location\.replace\('\/discord\/join'\)/)
  assert.match(discord, /href="\/discord\/join"/)
})

test('decorates sparse subpages with meaningful page, platform, and legal icons', () => {
  assert.match(app, /function enhancePageIcons\(\)/)
  assert.match(app, /\.install-hero, \.history-hero, \.legal-hero, \.discord-hero/)
  assert.match(app, /renderPlatformSvg\(mark, platform\)/)
  assert.match(app, /createSharedSvgNode\("legal", "section-symbol-svg"\)/)
  assert.match(css, /\.page-symbol-svg/)
  assert.match(css, /\.heading-with-icon/)
  assert.match(css, /\.platform-mark \.platform-svg/)
})

test('limits managed images to known slots and local versioned assets', () => {
  assert.match(app, /const SITE_IMAGE_SELECTORS = \{/)
  assert.ok(app.includes('/^\\/assets\\/managed\\/[a-z0-9.-]+$/'))
  assert.match(app, /document\.querySelectorAll\(selector\)/)
  assert.doesNotMatch(app, /siteContentPolicy[\s\S]{0,500}innerHTML/)
})
