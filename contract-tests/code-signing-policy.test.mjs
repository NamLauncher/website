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
  assert.match(home, /Authors and committers/)
  assert.match(home, /Reviewers/)
  assert.match(home, /Approvers/)
})
