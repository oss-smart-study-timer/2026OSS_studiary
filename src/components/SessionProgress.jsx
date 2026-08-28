export default function SessionProgress({ cycleProgress }) {
  const remaining = Math.max(0, 4 - cycleProgress)

  return (
    <section className="session-progress-card" aria-label="Progress toward long break">
      <div>
        <span className="kicker">POMODORO CYCLE</span>
        <h2>{cycleProgress >= 4 ? 'Long break unlocked' : `${remaining} focus session${remaining === 1 ? '' : 's'} to long break`}</h2>
        <p>Complete four full study sessions to earn a longer reset.</p>
      </div>
      <div className="cycle-dots" role="img" aria-label={`${cycleProgress} of 4 focus sessions completed`}>
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className={index < cycleProgress ? 'complete' : ''} aria-hidden="true" />
        ))}
      </div>
    </section>
  )
}
