import { MODES, formatTime } from '../utils/timerUtils'

export default function TimerDisplay({ mode, remainingSeconds, isRunning, isPaused }) {
  const details = MODES[mode]
  const status = isRunning ? details.status : isPaused ? 'Paused · your place is saved' : 'Ready when you are'

  return (
    <div className="timer-display">
      <span className="timer-eyebrow">{details.eyebrow}</span>
      <strong
        className="timer-time"
        role="timer"
        aria-label={`${formatTime(remainingSeconds)} remaining in ${details.label}`}
      >
        {formatTime(remainingSeconds)}
      </strong>
      <span className="timer-status">{status}</span>
    </div>
  )
}
