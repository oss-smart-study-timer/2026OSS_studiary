const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function sanitizeDailyStats(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return {}

  const clean = {}

  for (const [date, value] of Object.entries(candidate)) {
    if (!DATE_KEY_PATTERN.test(date) || !value || typeof value !== 'object' || Array.isArray(value)) {
      continue
    }

    clean[date] = {
      sessions: Math.max(
        0,
        Number.isFinite(Number(value.sessions)) ? Math.floor(Number(value.sessions)) : 0,
      ),
      focusMinutes: Math.max(
        0,
        Number.isFinite(Number(value.focusMinutes)) ? Math.round(Number(value.focusMinutes)) : 0,
      ),
    }
  }

  return clean
}

export function addStudyCompletion(candidate, dateKey, minutes) {
  const current = sanitizeDailyStats(candidate)
  const previous = current[dateKey] ?? { sessions: 0, focusMinutes: 0 }
  const completedMinutes = Math.max(1, Math.round(Number(minutes) || 0))

  return {
    ...current,
    [dateKey]: {
      sessions: previous.sessions + 1,
      focusMinutes: previous.focusMinutes + completedMinutes,
    },
  }
}
