// Author/creator: nattapat2871 (https://nattapat2871.me)
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const home = await readFile(new URL('../static/index.html', import.meta.url), 'utf8')
const app = await readFile(new URL('../static/assets/app.js', import.meta.url), 'utf8')

test('keeps direct hash navigation aligned while asynchronous homepage content settles', () => {
  assert.match(home, /<section id="download" class="section download-section">/)
  assert.ok(app.includes('function startInitialHashAlignment()'))
  assert.ok(app.includes('new ResizeObserver(queueHashAlignment)'))
  assert.ok(app.includes('performance.now() + 8000'))
  assert.ok(app.includes('target.scrollIntoView({ behavior: "instant", block: "start" })'))
  assert.ok(app.includes('window.addEventListener("hashchange", startInitialHashAlignment)'))
  assert.ok(app.includes('window.addEventListener("load", queueHashAlignment)'))
})

test('stops automatic realignment as soon as the visitor interacts with the page', () => {
  assert.ok(app.includes('window.addEventListener("wheel", cancelInitialHashAlignment'))
  assert.ok(app.includes('window.addEventListener("touchstart", cancelInitialHashAlignment'))
  assert.ok(app.includes('window.addEventListener("pointerdown", cancelInitialHashAlignment'))
  assert.ok(app.includes('["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]'))
})
