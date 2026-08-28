import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { addStudyCompletion, sanitizeDailyStats } from '../src/utils/statsUtils.js'
import { safeRead, safeWrite } from '../src/utils/storageUtils.js'
import {
  DEFAULT_SETTINGS,
  formatTime,
  getDateKey,
  getNextMode,
  normalizeCycleProgress,
  sanitizeBoolean,
  sanitizeSettings,
  sanitizeTheme,
  secondsForMode,
  validateSettings,
} from '../src/utils/timerUtils.js'

const scriptDir = resolve(fileURLToPath(new URL('.', import.meta.url)))
const root = resolve(scriptDir, '..')

const tests = []
function test(name, fn) {
  tests.push({ name, fn })
}

test('default and custom durations convert to seconds', () => {
  assert.equal(secondsForMode('study', DEFAULT_SETTINGS), 1500)
  const custom = { study: 30, shortBreak: 7, longBreak: 20, autoStart: false }
  assert.equal(secondsForMode('study', custom), 1800)
  assert.equal(secondsForMode('shortBreak', custom), 420)
  assert.equal(secondsForMode('longBreak', custom), 1200)
})

test('MM:SS formatting never becomes negative', () => {
  assert.equal(formatTime(1499), '24:59')
  assert.equal(formatTime(0), '00:00')
  assert.equal(formatTime(-30), '00:00')
})

test('settings validation rejects empty, zero, negative, decimal, and excessive values', () => {
  assert.deepEqual(validateSettings({ study: 30, shortBreak: 7, longBreak: 20 }), {})
  assert.ok(validateSettings({ study: '', shortBreak: 7, longBreak: 20 }).study)
  assert.ok(validateSettings({ study: 0, shortBreak: 7, longBreak: 20 }).study)
  assert.ok(validateSettings({ study: -1, shortBreak: 7, longBreak: 20 }).study)
  assert.ok(validateSettings({ study: 30.5, shortBreak: 7, longBreak: 20 }).study)
  assert.ok(validateSettings({ study: 121, shortBreak: 7, longBreak: 20 }).study)
})

test('corrupted settings preserve valid fields and safely default invalid fields', () => {
  assert.deepEqual(
    sanitizeSettings({ study: 30, shortBreak: 'broken', longBreak: 20, autoStart: 'false' }),
    { study: 30, shortBreak: 5, longBreak: 20, autoStart: false },
  )
  assert.equal(sanitizeBoolean('true', false), false)
  assert.equal(sanitizeTheme('neon', 'dark'), 'dark')
})

test('Pomodoro flow selects short break for sessions 1-3 and long break after session 4', () => {
  assert.equal(getNextMode('study', 1), 'shortBreak')
  assert.equal(getNextMode('study', 2), 'shortBreak')
  assert.equal(getNextMode('study', 3), 'shortBreak')
  assert.equal(getNextMode('study', 4), 'longBreak')
  assert.equal(getNextMode('shortBreak', 3), 'study')
  assert.equal(getNextMode('longBreak', 4), 'study')
  assert.equal(normalizeCycleProgress(99), 4)
  assert.equal(normalizeCycleProgress(-2), 0)
})

test('daily statistics are date-scoped and sanitized', () => {
  const first = addStudyCompletion({}, '2026-08-12', 30)
  const second = addStudyCompletion(first, '2026-08-12', 30)
  const nextDay = addStudyCompletion(second, '2026-08-13', 30)

  assert.deepEqual(nextDay['2026-08-12'], { sessions: 2, focusMinutes: 60 })
  assert.deepEqual(nextDay['2026-08-13'], { sessions: 1, focusMinutes: 30 })
  assert.deepEqual(sanitizeDailyStats({ bad: { sessions: 9 } }), {})
  assert.equal(getDateKey(new Date(2026, 7, 12, 23, 59, 59)), '2026-08-12')
})

test('safe localStorage helpers survive malformed JSON', () => {
  const memory = new Map()
  globalThis.localStorage = {
    getItem: (key) => memory.has(key) ? memory.get(key) : null,
    setItem: (key, value) => memory.set(key, value),
  }

  assert.equal(safeWrite('test', { ok: true }), true)
  assert.deepEqual(safeRead('test', null), { ok: true })
  memory.set('broken', '{not-json')
  assert.deepEqual(safeRead('broken', { fallback: true }), { fallback: true })
})

test('required project files exist and source has no console.log or latest dependencies', () => {
  const required = [
    'README.md',
    'PROJECT_GUIDE.md',
    'index.html',
    'package.json',
    'src/App.jsx',
    'src/hooks/useTimer.js',
    'src/components/SettingsModal.jsx',
    'src/styles/app.css',
  ]

  for (const path of required) {
    readFileSync(join(root, path), 'utf8')
  }

  const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const allVersions = { ...packageJson.dependencies, ...packageJson.devDependencies }
  assert.ok(Object.values(allVersions).every((version) => version !== 'latest'))

  const sourceFiles = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/\.(js|jsx)$/.test(entry.name)) sourceFiles.push(path)
    }
  }
  walk(join(root, 'src'))

  for (const file of sourceFiles) {
    const source = readFileSync(file, 'utf8')
    assert.equal(source.includes('console.log'), false, `${file} contains console.log`)
  }
})

let passed = 0
for (const { name, fn } of tests) {
  try {
    await fn()
    passed += 1
    process.stdout.write(`✓ ${name}\n`)
  } catch (error) {
    process.stderr.write(`✗ ${name}\n${error.stack}\n`)
    process.exitCode = 1
  }
}

if (process.exitCode) {
  process.stderr.write(`\nAudit failed: ${passed}/${tests.length} checks passed.\n`)
} else {
  process.stdout.write(`\nAudit passed: ${passed}/${tests.length} checks passed.\n`)
}
