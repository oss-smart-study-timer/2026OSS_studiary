import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'

export default function TimerControls({ isRunning, canResume, onStart, onPause, onReset, onSkip }) {
  return (
    <div className="timer-controls">
      <button
        type="button"
        className="secondary-control"
        onClick={onReset}
        aria-label="Reset timer"
        title="Reset (R)"
      >
        <RotateCcw size={19} aria-hidden="true" />
        <span>Reset</span>
      </button>

      <button
        type="button"
        className="primary-control"
        onClick={isRunning ? onPause : onStart}
        aria-label={isRunning ? 'Pause timer' : 'Start or resume timer'}
      >
        {isRunning ? <Pause size={21} aria-hidden="true" /> : <Play size={21} fill="currentColor" aria-hidden="true" />}
        <span>{isRunning ? 'Pause' : canResume ? 'Resume' : 'Start'}</span>
      </button>

      <button
        type="button"
        className="secondary-control"
        onClick={onSkip}
        aria-label="Skip current session"
        title="Skip (S)"
      >
        <SkipForward size={19} aria-hidden="true" />
        <span>Skip</span>
      </button>
    </div>
  )
}
