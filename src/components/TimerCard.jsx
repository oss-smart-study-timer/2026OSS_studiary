import ModeSelector from './ModeSelector'
import ProgressRing from './ProgressRing'
import TimerDisplay from './TimerDisplay'
import TimerControls from './TimerControls'

export default function TimerCard({
  mode,
  remainingSeconds,
  totalSeconds,
  isRunning,
  onModeChange,
  onStart,
  onPause,
  onReset,
  onSkip,
}) {
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0
  const canResume = !isRunning && remainingSeconds > 0 && remainingSeconds < totalSeconds

  return (
    <section className="timer-card" aria-label="Study timer">
      <ModeSelector mode={mode} onChange={onModeChange} />
      <ProgressRing progress={progress}>
        <TimerDisplay
          mode={mode}
          remainingSeconds={remainingSeconds}
          isRunning={isRunning}
          isPaused={canResume}
        />
      </ProgressRing>
      <TimerControls
        isRunning={isRunning}
        canResume={canResume}
        onStart={onStart}
        onPause={onPause}
        onReset={onReset}
        onSkip={onSkip}
      />
    </section>
  )
}
