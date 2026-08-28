import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DURATION_LIMITS,
  getNextMode,
  MODES,
  normalizeCycleProgress,
  secondsForMode,
  STORAGE_KEYS,
} from '../utils/timerUtils'
import { safeRead, safeWrite } from '../utils/storageUtils'

function clampSessionDuration(mode, candidate, settings) {
  const fallback = Number(settings[mode])
  const value = Number(candidate)
  const limits = DURATION_LIMITS[mode]

  if (!limits || !Number.isFinite(value)) return fallback
  return Math.min(limits.max, Math.max(limits.min, value))
}


function getRemainingFromTarget(timer, now = Date.now()) {
  const durationSeconds = Number(timer.sessionDurationMinutes) * 60
  const totalSeconds = Number.isFinite(durationSeconds) && durationSeconds > 0
    ? Math.max(1, Math.round(durationSeconds))
    : Math.max(1, Math.ceil(Number(timer.remainingSeconds) || 1))
  const calculated = timer.targetEnd
    ? Math.ceil((Number(timer.targetEnd) - now) / 1000)
    : Number(timer.remainingSeconds)

  return Math.min(totalSeconds, Math.max(0, Number.isFinite(calculated) ? calculated : totalSeconds))
}

function createInitialTimerState(settings) {
  const fallback = {
    mode: 'study',
    remainingSeconds: secondsForMode('study', settings),
    isRunning: false,
    targetEnd: null,
    cycleProgress: 0,
    sessionDurationMinutes: settings.study,
  }

  const saved = safeRead(STORAGE_KEYS.timerState, null)
  if (!saved || typeof saved !== 'object' || Array.isArray(saved) || !MODES[saved.mode]) {
    return fallback
  }

  const mode = saved.mode
  const cycleProgress = normalizeCycleProgress(saved.cycleProgress)
  const sessionDurationMinutes = clampSessionDuration(mode, saved.sessionDurationMinutes, settings)
  const sessionTotalSeconds = Math.max(1, Math.round(sessionDurationMinutes * 60))
  const savedRemaining = Number(saved.remainingSeconds)
  const targetEnd = Number(saved.targetEnd)
  const isRunning = Boolean(saved.isRunning && Number.isFinite(targetEnd))

  let remainingSeconds = Number.isFinite(savedRemaining)
    ? Math.min(sessionTotalSeconds, Math.max(0, Math.ceil(savedRemaining)))
    : sessionTotalSeconds

  if (isRunning) {
    remainingSeconds = Math.min(
      sessionTotalSeconds,
      Math.max(0, Math.ceil((targetEnd - Date.now()) / 1000)),
    )
  }

  return {
    mode,
    remainingSeconds,
    isRunning,
    targetEnd: isRunning ? targetEnd : null,
    cycleProgress,
    sessionDurationMinutes,
  }
}

export function useTimer({ settings, onStudyComplete, onSessionComplete }) {
  const [timer, setTimer] = useState(() => createInitialTimerState(settings))
  const timerRef = useRef(timer)
  const completionLockRef = useRef(false)
  const previousSettingsRef = useRef(settings)

  useEffect(() => {
    timerRef.current = timer
    safeWrite(STORAGE_KEYS.timerState, timer)
  }, [timer])

  const finishSession = useCallback(() => {
    if (completionLockRef.current) return
    completionLockRef.current = true

    const current = timerRef.current
    const completedMode = current.mode
    let nextCycleProgress = normalizeCycleProgress(current.cycleProgress)

    if (completedMode === 'study') {
      nextCycleProgress = Math.min(4, nextCycleProgress + 1)
      const completedAt = Number.isFinite(Number(current.targetEnd))
        ? Number(current.targetEnd)
        : Date.now()
      onStudyComplete(current.sessionDurationMinutes, completedAt)
    } else if (completedMode === 'longBreak') {
      nextCycleProgress = 0
    }

    const nextMode = getNextMode(completedMode, nextCycleProgress)
    const nextSeconds = secondsForMode(nextMode, settings)
    const shouldAutoStart = Boolean(settings.autoStart)

    onSessionComplete({
      completedMode,
      nextMode,
      longBreakUnlocked: completedMode === 'study' && nextCycleProgress >= 4,
    })

    setTimer({
      mode: nextMode,
      remainingSeconds: nextSeconds,
      isRunning: shouldAutoStart,
      targetEnd: shouldAutoStart ? Date.now() + nextSeconds * 1000 : null,
      cycleProgress: nextCycleProgress,
      sessionDurationMinutes: settings[nextMode],
    })

    queueMicrotask(() => {
      completionLockRef.current = false
    })
  }, [onSessionComplete, onStudyComplete, settings])

  useEffect(() => {
    if (!timer.isRunning) return undefined

    const tick = () => {
      const current = timerRef.current
      if (!current.isRunning || !current.targetEnd) return

      const remaining = getRemainingFromTarget(current)

      if (remaining <= 0) {
        if (current.remainingSeconds !== 0) {
          setTimer((previous) => ({ ...previous, remainingSeconds: 0 }))
        }
        finishSession()
        return
      }

      if (remaining !== current.remainingSeconds) {
        setTimer((previous) => ({ ...previous, remainingSeconds: remaining }))
      }
    }

    tick()
    const intervalId = window.setInterval(tick, 250)
    return () => window.clearInterval(intervalId)
  }, [finishSession, timer.isRunning])

  useEffect(() => {
    if (timer.isRunning && timer.remainingSeconds <= 0) finishSession()
  }, [finishSession, timer.isRunning, timer.remainingSeconds])

  useEffect(() => {
    const previous = previousSettingsRef.current
    previousSettingsRef.current = settings

    const durationChanged =
      previous.study !== settings.study ||
      previous.shortBreak !== settings.shortBreak ||
      previous.longBreak !== settings.longBreak

    if (!durationChanged || timerRef.current.isRunning) return

    const current = timerRef.current
    const previousFullSeconds = secondsForMode(current.mode, previous)
    const looksIdle = current.remainingSeconds === previousFullSeconds

    if (looksIdle) {
      const nextSeconds = secondsForMode(current.mode, settings)
      setTimer((previousTimer) => ({
        ...previousTimer,
        remainingSeconds: nextSeconds,
        sessionDurationMinutes: settings[current.mode],
      }))
    }
  }, [settings])

  const start = useCallback(() => {
    setTimer((previous) => {
      if (previous.isRunning) return previous

      const remaining = previous.remainingSeconds > 0
        ? previous.remainingSeconds
        : secondsForMode(previous.mode, settings)

      completionLockRef.current = false

      return {
        ...previous,
        remainingSeconds: remaining,
        isRunning: true,
        targetEnd: Date.now() + remaining * 1000,
        sessionDurationMinutes:
          previous.remainingSeconds > 0
            ? previous.sessionDurationMinutes
            : settings[previous.mode],
      }
    })
  }, [settings])

  const pause = useCallback(() => {
    const current = timerRef.current
    if (!current.isRunning) return

    const remaining = getRemainingFromTarget(current)

    if (remaining <= 0) {
      finishSession()
      return
    }

    setTimer((previous) => ({
      ...previous,
      remainingSeconds: remaining,
      isRunning: false,
      targetEnd: null,
    }))
  }, [finishSession])

  const reset = useCallback(() => {
    completionLockRef.current = false
    setTimer((previous) => ({
      ...previous,
      remainingSeconds: secondsForMode(previous.mode, settings),
      isRunning: false,
      targetEnd: null,
      sessionDurationMinutes: settings[previous.mode],
    }))
  }, [settings])

  const skip = useCallback(() => {
    completionLockRef.current = false

    setTimer((previous) => {
      let nextCycleProgress = normalizeCycleProgress(previous.cycleProgress)
      if (previous.mode === 'longBreak') nextCycleProgress = 0

      const nextMode = getNextMode(previous.mode, nextCycleProgress)
      const nextSeconds = secondsForMode(nextMode, settings)

      return {
        mode: nextMode,
        remainingSeconds: nextSeconds,
        isRunning: false,
        targetEnd: null,
        cycleProgress: nextCycleProgress,
        sessionDurationMinutes: settings[nextMode],
      }
    })
  }, [settings])

  const switchMode = useCallback((mode) => {
    if (!MODES[mode]) return
    completionLockRef.current = false

    setTimer((previous) => ({
      ...previous,
      mode,
      remainingSeconds: secondsForMode(mode, settings),
      isRunning: false,
      targetEnd: null,
      sessionDurationMinutes: settings[mode],
    }))
  }, [settings])

  return {
    ...timer,
    start,
    pause,
    reset,
    skip,
    switchMode,
  }
}
