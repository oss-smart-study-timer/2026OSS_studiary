import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { DEFAULT_SETTINGS, DURATION_LIMITS, validateSettings } from '../utils/timerUtils'

const fields = [
  { key: 'study', label: 'Study duration', suffix: 'minutes' },
  { key: 'shortBreak', label: 'Short break', suffix: 'minutes' },
  { key: 'longBreak', label: 'Long break', suffix: 'minutes' },
]

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'input:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function SettingsModal({
  open,
  settings,
  soundEnabled,
  notificationsEnabled,
  notificationPermission,
  onSave,
  onResetDefaults,
  onToggleSound,
  onToggleNotifications,
  onClose,
}) {
  const [draft, setDraft] = useState(settings)
  const [errors, setErrors] = useState({})
  const dialogRef = useRef(null)
  const firstInputRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    if (open) {
      setDraft(settings)
      setErrors({})
    }
  }, [open, settings])

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const frameId = window.requestAnimationFrame(() => {
      firstInputRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
      document.body.style.overflow = previousOverflow
      const previousFocus = previousFocusRef.current
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus()
      }
    }
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const updateDuration = (key, value) => {
    if (value !== '' && !/^\d{1,3}$/.test(value)) return

    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validation = validateSettings(draft)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    onSave({
      study: Number(draft.study),
      shortBreak: Number(draft.shortBreak),
      longBreak: Number(draft.longBreak),
      autoStart: Boolean(draft.autoStart),
    })
    onClose()
  }

  const resetDraft = () => {
    setDraft(DEFAULT_SETTINGS)
    setErrors({})
    onResetDefaults()
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialogRef}
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        aria-describedby="settings-note"
      >
        <div className="modal-header">
          <div>
            <span className="kicker">PREFERENCES</span>
            <h2 id="settings-title">Timer settings</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close settings">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="settings-fields">
            {fields.map(({ key, label, suffix }, index) => (
              <label className="settings-field" key={key}>
                <span>{label}</span>
                <div className="number-input-wrap">
                  <input
                    ref={index === 0 ? firstInputRef : undefined}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    value={draft[key]}
                    onChange={(event) => updateDuration(key, event.target.value)}
                    aria-required="true"
                    aria-invalid={Boolean(errors[key])}
                    aria-describedby={errors[key] ? `${key}-error` : undefined}
                    autoComplete="off"
                  />
                  <span>{suffix}</span>
                </div>
                <small className="field-hint">{DURATION_LIMITS[key].min}–{DURATION_LIMITS[key].max} minutes</small>
                {errors[key] && <small className="field-error" id={`${key}-error`}>{errors[key]}</small>}
              </label>
            ))}
          </div>

          <div className="settings-options">
            <label className="switch-row">
              <span>
                <strong>Auto-start next session</strong>
                <small>Automatically begin the next focus or break timer.</small>
              </span>
              <input
                className="switch-control"
                type="checkbox"
                checked={Boolean(draft.autoStart)}
                onChange={(event) => setDraft((current) => ({ ...current, autoStart: event.target.checked }))}
                aria-label="Auto-start next session"
              />
            </label>

            <button className="setting-action" type="button" onClick={onToggleSound} aria-pressed={soundEnabled}>
              <span className="setting-action-icon" aria-hidden="true">
                {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
              </span>
              <span>
                <strong>Completion sound</strong>
                <small>{soundEnabled ? 'On' : 'Off'} · stored on this device</small>
              </span>
              <span className={`status-pill ${soundEnabled ? 'on' : ''}`}>{soundEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              className="setting-action"
              type="button"
              onClick={onToggleNotifications}
              aria-pressed={notificationsEnabled}
            >
              <span className="setting-action-icon" aria-hidden="true">
                {notificationsEnabled ? <Bell size={19} /> : <BellOff size={19} />}
              </span>
              <span>
                <strong>Browser notifications</strong>
                <small>
                  {notificationPermission === 'unsupported'
                    ? 'Not supported by this browser'
                    : notificationPermission === 'denied'
                      ? 'Blocked by browser'
                      : notificationsEnabled
                        ? 'On'
                        : 'Optional'}
                </small>
              </span>
              <span className={`status-pill ${notificationsEnabled ? 'on' : ''}`}>{notificationsEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <p className="settings-note" id="settings-note">
            Changing durations does not interrupt a timer that is currently running. New values apply on the next reset or session.
          </p>

          <div className="modal-actions">
            <button className="ghost-button" type="button" onClick={resetDraft}>
              <RotateCcw size={17} aria-hidden="true" /> Reset defaults
            </button>
            <button className="save-button" type="submit">Save settings</button>
          </div>
        </form>
      </section>
    </div>
  )
}
