export const MODES = {
  study: {
    key: 'study',
    label: 'Study',
    eyebrow: 'FOCUS SESSION',
    status: 'Stay focused',
  },
  shortBreak: {
    key: 'shortBreak',
    label: 'Short Break',
    eyebrow: 'QUICK RESET',
    status: 'Recharge gently',
  },
  longBreak: {
    key: 'longBreak',
    label: 'Long Break',
    eyebrow: 'DEEP RESET',
    status: 'You earned this break',
  },
}

export const DEFAULT_SETTINGS = {
  study: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStart: false,
}

export const STORAGE_KEYS = {
  settings: 'smartStudyTimer.settings',
  theme: 'smartStudyTimer.theme',
  soundEnabled: 'smartStudyTimer.soundEnabled',
  notificationsEnabled: 'smartStudyTimer.notificationsEnabled',
  dailyStats: 'smartStudyTimer.dailyStats',
  timerState: 'smartStudyTimer.timerState',
}

export const DURATION_LIMITS = {
  study: { min: 1, max: 120 },
  shortBreak: { min: 1, max: 60 },
  longBreak: { min: 1, max: 90 },
}

const DURATION_KEYS = ['study', 'shortBreak', 'longBreak']

export const normalizeCycleProgress = (value) => {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return 0
  return Math.min(4, Math.max(0, Math.floor(numeric)))
}

export const secondsForMode = (mode, settings = DEFAULT_SETTINGS) => {
  const fallbackMinutes = Number(DEFAULT_SETTINGS[mode] ?? DEFAULT_SETTINGS.study)
  const candidateMinutes = Number(settings?.[mode])
  const minutes = Number.isFinite(candidateMinutes) && candidateMinutes > 0
    ? candidateMinutes
    : fallbackMinutes
  return Math.max(1, Math.round(minutes * 60))
}

export const formatTime = (seconds) => {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  const minutes = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export const getDateKey = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const validateSettings = (draft) => {
  const errors = {}

  for (const key of DURATION_KEYS) {
    const rawValue = draft?.[key]
    const value = Number(rawValue)
    const { min, max } = DURATION_LIMITS[key]

    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      errors[key] = 'This duration is required.'
    } else if (!Number.isFinite(value) || !Number.isInteger(value) || value < min || value > max) {
      errors[key] = `Use a whole number from ${min} to ${max}.`
    }
  }

  return errors
}

export const sanitizeSettings = (candidate) => {
  const source = candidate && typeof candidate === 'object' && !Array.isArray(candidate)
    ? candidate
    : {}

  const clean = { ...DEFAULT_SETTINGS }

  for (const key of DURATION_KEYS) {
    const value = Number(source[key])
    const { min, max } = DURATION_LIMITS[key]
    if (Number.isInteger(value) && value >= min && value <= max) {
      clean[key] = value
    }
  }

  clean.autoStart = typeof source.autoStart === 'boolean'
    ? source.autoStart
    : DEFAULT_SETTINGS.autoStart

  return clean
}

export const sanitizeBoolean = (candidate, fallback = false) => (
  typeof candidate === 'boolean' ? candidate : fallback
)

export const sanitizeTheme = (candidate, fallback = 'light') => (
  candidate === 'dark' || candidate === 'light' ? candidate : fallback
)

export const getNextMode = (completedMode, cycleProgress) => {
  if (completedMode === 'study') {
    return normalizeCycleProgress(cycleProgress) >= 4 ? 'longBreak' : 'shortBreak'
  }
  return 'study'
}
