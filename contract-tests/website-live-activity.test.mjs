// Author/creator: nattapat2871 (https://nattapat2871.me)
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

const source = await readFile(new URL('../static/assets/app.js', import.meta.url), 'utf8')
const section = (start, end) => source.slice(source.indexOf(`function ${start}`), source.indexOf(`function ${end}`))
const context = vm.createContext({})
vm.runInContext([
  section('cleanDiscordText', 'discordAssetExtension'),
  section('normalizeDeveloperActivities', 'renderDeveloperActivity'),
  section('extractDeveloperProfile', 'connectDeveloperActivitySocket')
].join('\n'), context)
const { normalizeDeveloperActivities: normalize, extractDeveloperProfile: extract, createDeveloperActivityConnection: create } = context
const profile = activities => ({ discord_status: 'online', activities })
const watching = (time, state = 'episode', overrides = {}) => ({ application_id: '981509069309354054', type: 3, name: 'Crunchyroll', created_at: time, state, ...overrides })
const game = { application_id: '1402418491272986635', type: 0, name: 'Minecraft', created_at: 1000 }

function fixture({ online = true, WebSocketImpl } = {}) {
  const sockets = [], timers = new Map(), snapshots = [], states = []
  let timerId = 0
  class Socket {
    handlers = new Map()
    closed = false
    constructor(url) { this.url = url; sockets.push(this) }
    addEventListener(event, callback) { this.handlers.set(event, callback) }
    emit(event, data) { this.handlers.get(event)?.(data) }
    message(value) { this.emit('message', { data: JSON.stringify(value) }) }
    close() { this.closed = true; this.emit('close') }
  }
  const connection = create({
    url: 'wss://ame-api.nattapat2871.me/ws/v1/user/1007237437627572275',
    WebSocketImpl: WebSocketImpl || Socket,
    onProfile: data => snapshots.push(data), onUnavailable: state => states.push(state),
    setTimer: (callback, delay) => { const id = ++timerId; timers.set(id, { callback, delay }); return id },
    clearTimer: id => timers.delete(id), random: () => 0, isOnline: () => online
  })
  const runTimer = () => {
    assert.equal(timers.size, 1)
    const [id, value] = timers.entries().next().value
    timers.delete(id); value.callback()
    return value.delay
  }
  return { connection, sockets, timers, snapshots, states, runTimer, setOnline: value => { online = value } }
}

test('uses only WebSocket for live presence, not cached REST or polling', () => {
  assert(!source.includes('/api/developer-profile'))
  assert(!source.includes('loadDeveloperProfile'))
  assert(!source.includes('activityRefreshTimer'))
  assert(source.includes('window.addEventListener("pageshow"'))
  assert(source.includes('window.addEventListener("offline"'))
  assert(source.includes('window.addEventListener("online"'))
})

test('deduplicates before applying the display limit so Minecraft remains visible', () => {
  const result = normalize(profile([watching(2000, 'old'), watching(4000, 'latest'), watching(3000), watching(2500), game]))
  assert.equal(result.length, 2)
  assert.equal(result[0].state, 'latest')
  assert.equal(result[1].name, 'Minecraft')
})

test('compares timestamp units and uses creation time rather than episode playback start', () => {
  const result = normalize(profile([
    watching(1788500000000, 'old', { timestamps: { start: 1788500500000 } }),
    watching(1788500010, 'new', { timestamps: { start: 1788490000000 } })
  ]))
  assert.equal(result[0].state, 'new')
})

test('deduplicates missing application IDs by normalized name and type', () => {
  const result = normalize(profile([watching(2000, 'old', { application_id: null, name: 'CRUNCHYROLL' }), watching(3000, 'new', { application_id: undefined })]))
  assert.equal(result.length, 1)
  assert.equal(result[0].state, 'new')
})

test('does not expire a long-running game based on its original start timestamp', () => {
  assert.equal(normalize(profile([game]))[0].name, 'Minecraft')
  assert.equal(normalize({ discord_status: 'offline', activities: [game] }).length, 0)
  assert.equal(normalize(profile([])).length, 0)
})

test('rejects custom/malformed activities and ignores incomplete frames', () => {
  assert.equal(normalize(profile([null, [], { type: 4, name: 'status' }, { type: 99, name: 'bad' }, game])).length, 1)
  assert.equal(extract({ user: {} }), null)
  assert.equal(extract({ activities: [], discord_status: 'invalid' }), null)
  assert.equal(extract({ ame: profile([]) }).activities.length, 0)
  assert.equal(extract({ data: { ame: profile([game]) } }).activities[0].name, 'Minecraft')
})

test('replaces each snapshot, including empty updates, with a single connection', () => {
  const f = fixture()
  f.connection.start(); f.connection.start()
  assert.equal(f.sockets.length, 1)
  f.sockets[0].message({ ame: profile([game]) })
  f.sockets[0].message({ ame: profile([]) })
  assert.equal(f.snapshots.length, 2)
  assert.equal(f.snapshots[1].activities.length, 0)
  assert.equal(f.timers.size, 0, 'a healthy silent socket must not be timed out as stale')
})

test('disconnect clears activity, retries, and rejects messages from old connections', () => {
  const f = fixture()
  f.connection.start()
  const old = f.sockets[0]
  old.message(profile([game])); old.emit('close')
  assert.equal(f.states.at(-1), 'unavailable')
  assert.equal(f.runTimer(), 1000)
  old.message(profile([watching(3000)])); old.emit('close')
  assert.equal(f.snapshots.length, 1)
  f.sockets[1].message(profile([]))
  assert.equal(f.snapshots.length, 2)
  assert.equal(f.timers.size, 0)
})

test('initial snapshot timeout and malformed/oversized frames reconnect without stale data', () => {
  for (const bad of ['{', JSON.stringify({ user: {} }), 'x'.repeat(1024 * 1024 + 1)]) {
    const f = fixture()
    f.connection.start()
    assert.equal(f.runTimer(), 10000)
    assert(f.sockets[0].closed)
    f.runTimer()
    f.sockets[1].emit('message', { data: bad })
    assert.equal(f.states.at(-1), 'unavailable')
    assert(f.sockets[1].closed)
    assert.equal(f.snapshots.length, 0)
  }
})

test('reconnect backoff is bounded and resets after a valid snapshot', () => {
  const f = fixture(); f.connection.start()
  for (const delay of [1000, 2000, 4000, 8000, 16000, 30000, 30000]) {
    f.sockets.at(-1).emit('error')
    assert.equal(f.runTimer(), delay)
  }
  f.sockets.at(-1).message(profile([])); f.sockets.at(-1).emit('close')
  assert.equal(f.runTimer(), 1000)
})

test('offline and pagehide stop all work; returning online or from BFCache starts fresh', () => {
  const f = fixture(); f.connection.start()
  const old = f.sockets[0]
  f.setOnline(false); f.connection.stop()
  assert(old.closed); assert.equal(f.timers.size, 0)
  old.message(profile([game])); assert.equal(f.snapshots.length, 0)
  f.connection.start(); assert.equal(f.sockets.length, 1)
  f.setOnline(true); f.connection.reconnect()
  assert.equal(f.sockets.length, 2)
  f.sockets[1].message(profile([])); f.connection.stop(); f.connection.start()
  assert.equal(f.sockets.length, 3)
})

test('constructor failure uses a bounded retry instead of crashing the page', () => {
  const f = fixture({ WebSocketImpl: class { constructor() { throw new Error('Unavailable') } } })
  assert.doesNotThrow(() => f.connection.start())
  assert.equal(f.states.at(-1), 'unavailable')
  assert.equal(f.timers.size, 1)
  f.connection.stop(); assert.equal(f.timers.size, 0)
})
