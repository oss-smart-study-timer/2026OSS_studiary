import { Clock3, Flame, TimerReset } from 'lucide-react'

export default function StatsPanel({ sessions, focusMinutes, cycleProgress, nextSession }) {
  const stats = [
    { label: "Today's Sessions", value: sessions, icon: Flame },
    { label: 'Focus Minutes', value: `${focusMinutes} min`, icon: Clock3 },
    { label: 'Long Break Progress', value: `${cycleProgress} / 4`, icon: TimerReset },
  ]

  return (
    <aside className="stats-panel" aria-label="Today’s focus statistics">
      <div className="section-heading-row">
        <div>
          <span className="kicker">TODAY</span>
          <h2>Your focus snapshot</h2>
        </div>
        <span className="next-chip">Next: {nextSession}</span>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article className="stat-card" key={label}>
            <span className="stat-icon" aria-hidden="true"><Icon size={18} /></span>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
    </aside>
  )
}
