// Author/creator: nattapat2871 (https://nattapat2871.me)
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const home = await readFile(new URL('../static/index.html', import.meta.url), 'utf8')
const app = await readFile(new URL('../static/assets/app.js', import.meta.url), 'utf8')

test('publishes the required SignPath code signing policy on the download page', () => {
  assert.match(home, /id="code-signing-policy"/)
  assert.match(home, />Code signing policy</)
  assert.match(
    app,
    /Free code signing provided by SignPath\.io, certificate by SignPath Foundation\./,
  )
  assert.match(home, /CODE_SIGNING_POLICY\.md/)
  assert.match(home, /href="\/legal"/)
  assert.match(home, /Author, reviewer, and approver/)
  assert.equal((home.match(/>Nattapat2871<\/a>/g) || []).filter(Boolean).length >= 1, true)
  assert.match(home, /Application pending review/)
  assert.match(home, /The current public release remains unsigned/)
  assert.match(home, /Development began privately in June 2026/)
  assert.ok(home.includes('github.com/NamLauncher/NamLauncher'))
  assert.doesNotMatch(home, /SignPath (?:application )?approved/i)
})

test('keeps the SignPath status beside the primary download action', () => {
  assert.match(home, /class="hero-signing-note"/)
  assert.match(home, /currently applying to the SignPath Foundation/)
})
