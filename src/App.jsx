import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import KeyboardHelp from './components/KeyboardHelp'
import SessionProgress from './components/SessionProgress'
import SettingsModal from './components/SettingsModal'
import StatsPanel from './components/StatsPanel'
import TimerCard from './components/TimerCard'
import Toast from './components/Toast'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTimer } from './hooks/useTimer'
import { playCompletionTone, primeCompletionAudio } from './utils/audioUtils'
import { addStudyCompletion, sanitizeDailyStats } from './utils/statsUtils'
import {
  DEFAULT_SETTINGS,
  formatTime,
  getDateKey,
  MODES,
  sanitizeBoolean,
  sanitizeSettings,
  sanitizeTheme,
  STORAGE_KEYS,
} from './utils/timerUtils'

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme() {
  const bootTheme = document.documentElement.dataset.theme
  if (bootTheme === 'light' || bootTheme === 'dark') return bootTheme
  return getSystemTheme()
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return ['input', 'textarea', 'select'].includes(tag) || target.isContentEditable
}

export default function App() {
  const [storedSettings, setStoredSettings] = useLocalStorage(STORAGE_KEYS.settings, DEFAULT_SETTINGS)
  const [storedTheme, setStoredTheme] = useLocalStorage(STORAGE_KEYS.theme, getInitialTheme)
  const [storedSoundEnabled, setStoredSoundEnabled] = useLocalStorage(STORAGE_KEYS.soundEnabled, true)
  const [storedNotificationsEnabled, setStoredNotificationsEnabled] = useLocalStorage(
    STORAGE_KEYS.notificationsEnabled,
    false,
  )
  const [storedDailyStats, setStoredDailyStats] = useLocalStorage(STORAGE_KEYS.dailyStats, {})

  const settings = useMemo(() => sanitizeSettings(storedSettings), [storedSettings])
  const theme = sanitizeTheme(storedTheme, getSystemTheme())
  const soundEnabled = sanitizeBoolean(storedSoundEnabled, true)
  const notificationPreference = sanitizeBoolean(storedNotificationsEnabled, false)
  const dailyStats = useMemo(() => sanitizeDailyStats(storedDailyStats), [storedDailyStats])

  const [dateKey, setDateKey] = useState(() => getDateKey())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [notificationPermission, setNotificationPermission] = useState(() => (
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  ))

  const notificationsEnabled = notificationPreference && notificationPermission === 'granted'
  const today = dailyStats[dateKey] ?? { sessions: 0, focusMinutes: 0 }

  const recordStudyCompletion = useCallback((minutes, completedAtTimestamp = Date.now()) => {
    const completedAt = new Date(Number(completedAtTimestamp))
    const completionDate = Number.isNaN(completedAt.getTime())
      ? getDateKey()
      : getDateKey(completedAt)

    setStoredDailyStats((current) => addStudyCompletion(current, completionDate, minutes))
    setDateKey(getDateKey())
  }, [setStoredDailyStats])

  const playCompletionSound = useCallback(() => {
    if (!soundEnabled) return
    void playCompletionTone()
  }, [soundEnabled])

  const sendBrowserNotification = useCallback((title, body) => {
    if (!notificationsEnabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return
    }

    try {
      new Notification(title, { body, tag: 'smart-study-timer-complete' })
    } catch {
      // The in-app toast remains the reliable fallback.
    }
  }, [notificationsEnabled])

  const handleSessionComplete = useCallback(({ completedMode, nextMode, longBreakUnlocked }) => {
    playCompletionSound()

    const message = completedMode === 'study'
      ? longBreakUnlocked
        ? 'Excellent focus session. Long break unlocked.'
        : 'Focus session complete! Time for a short break.'
      : `${MODES[completedMode].label} complete. Ready to focus again?`

    setToast(message)
    sendBrowserNotification(
      completedMode === 'study' ? 'Study session complete' : `${MODES[completedMode].label} complete`,
      `Next: ${MODES[nextMode].label}.`,
    )
  }, [playCompletionSound, sendBrowserNotification])

  const timer = useTimer({
    settings,
    onStudyComplete: recordStudyCompletion,
    onSessionComplete: handleSessionComplete,
  })

  const handleStart = useCallback(() => {
    if (soundEnabled) primeCompletionAudio()
    timer.start()
  }, [soundEnabled, timer.start])

  const handleToggleSound = useCallback(() => {
    const nextValue = !soundEnabled
    setStoredSoundEnabled(nextValue)
    if (nextValue) primeCompletionAudio()
    setToast(`Completion sound ${nextValue ? 'enabled' : 'disabled'}.`)
  }, [setStoredSoundEnabled, soundEnabled])

  const handleOpenSettings = useCallback(() => setSettingsOpen(true), [])
  const handleCloseSettings = useCallback(() => setSettingsOpen(false), [])
  const handleToggleTheme = useCallback(() => {
    setStoredTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setStoredTheme, theme])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) metaTheme.setAttribute('content', theme === 'dark' ? '#0c1118' : '#f4f6f9')
  }, [theme])

  useEffect(() => {
    document.title = timer.isRunning
      ? `${formatTime(timer.remainingSeconds)} • ${MODES[timer.mode].label} | Smart Study Timer`
      : 'Smart Study Timer'

    return () => {
      document.title = 'Smart Study Timer'
    }
  }, [timer.isRunning, timer.mode, timer.remainingSeconds])

  useEffect(() => {
    let midnightTimerId

    const syncDate = () => {
      setDateKey(getDateKey())
      window.clearTimeout(midnightTimerId)

      const now = new Date()
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        150,
      )
      midnightTimerId = window.setTimeout(syncDate, Math.max(1000, nextMidnight.getTime() - now.getTime()))
    }

    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') syncDate()
    }

    syncDate()
    window.addEventListener('focus', syncDate)
    document.addEventListener('visibilitychange', syncWhenVisible)

    return () => {
      window.clearTimeout(midnightTimerId)
      window.removeEventListener('focus', syncDate)
      document.removeEventListener('visibilitychange', syncWhenVisible)
    }
  }, [])

  useEffect(() => {
    if (typeof Notification === 'undefined') return undefined

    const syncPermission = () => setNotificationPermission(Notification.permission)
    window.addEventListener('focus', syncPermission)
    document.addEventListener('visibilitychange', syncPermission)

    return () => {
      window.removeEventListener('focus', syncPermission)
      document.removeEventListener('visibilitychange', syncPermission)
    }
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(''), 4200)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (settingsOpen || isTypingTarget(event.target)) return

      if (event.code === 'Space') {
        event.preventDefault()
        timer.isRunning ? timer.pause() : handleStart()
      } else if (event.key.toLowerCase() === 'r') {
        timer.reset()
      } else if (event.key.toLowerCase() === 's') {
        timer.skip()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleStart, settingsOpen, timer.isRunning, timer.pause, timer.reset, timer.skip])

  const handleSaveSettings = useCallback((nextSettings) => {
    setStoredSettings(sanitizeSettings(nextSettings))
    setToast('Settings saved.')
  }, [setStoredSettings])

  const handleResetDefaults = useCallback(() => {
    setStoredSettings(DEFAULT_SETTINGS)
    setToast('Timer defaults restored.')
  }, [setStoredSettings])

  const handleToggleNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setStoredNotificationsEnabled(false)
      setNotificationPermission('unsupported')
      setToast('Browser notifications are not supported here.')
      return
    }

    if (notificationsEnabled) {
      setStoredNotificationsEnabled(false)
      setToast('Browser notifications turned off.')
      return
    }

    if (Notification.permission === 'denied') {
      setNotificationPermission('denied')
      setStoredNotificationsEnabled(false)
      setToast('Notifications are blocked in your browser settings.')
      return
    }

    try {
      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission()

      setNotificationPermission(permission)
      const enabled = permission === 'granted'
      setStoredNotificationsEnabled(enabled)
      setToast(enabled ? 'Browser notifications enabled.' : 'Notification permission was not granted.')
    } catch {
      setStoredNotificationsEnabled(false)
      setToast('Browser notifications could not be enabled.')
    }
  }, [notificationsEnabled, setStoredNotificationsEnabled])

  const nextSession = timer.mode === 'study'
    ? timer.cycleProgress >= 3 ? 'Long Break' : 'Short Break'
    : 'Study'

  const totalSeconds = Math.max(1, Math.round(timer.sessionDurationMinutes * 60))

  return (
    <div className="app-shell">
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={handleOpenSettings}
      />

      <main id="main" className="dashboard">
        <section className="hero-copy">
          <span className="kicker">STUDY SMARTER, NOT LONGER</span>
          <h1>Turn focused minutes into meaningful progress.</h1>
          <p>A calm Pomodoro workspace built to help you protect your attention, recover intentionally, and keep momentum visible.</p>
        </section>

        <StatsPanel
          sessions={today.sessions}
          focusMinutes={today.focusMinutes}
          cycleProgress={timer.cycleProgress}
          nextSession={nextSession}
        />

        <TimerCard
          mode={timer.mode}
          remainingSeconds={timer.remainingSeconds}
          totalSeconds={totalSeconds}
          isRunning={timer.isRunning}
          onModeChange={timer.switchMode}
          onStart={handleStart}
          onPause={timer.pause}
          onReset={timer.reset}
          onSkip={timer.skip}
        />

        <div className="side-stack">
          <SessionProgress cycleProgress={timer.cycleProgress} />
          <section className="focus-note-card">
            <span className="kicker">FOCUS NOTE</span>
            <blockquote>“One session. One task. No noise.”</blockquote>
            <p>Keep this session deliberately small. Your only job is to protect the current block of focused time.</p>
          </section>
          <KeyboardHelp />
        </div>
      </main>

      <footer>
        <span>Smart Study Timer</span>
        <span>Local-first · No account · No tracking</span>
      </footer>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        soundEnabled={soundEnabled}
        notificationsEnabled={notificationsEnabled}
        notificationPermission={notificationPermission}
        onSave={handleSaveSettings}
        onResetDefaults={handleResetDefaults}
        onToggleSound={handleToggleSound}
        onToggleNotifications={handleToggleNotifications}
        onClose={handleCloseSettings}
      />

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
