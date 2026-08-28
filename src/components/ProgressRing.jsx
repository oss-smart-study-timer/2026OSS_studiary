export default function ProgressRing({ progress, children }) {
  const radius = 132
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, progress))
  const dashOffset = circumference * (1 - clamped)

  return (
    <div className="progress-ring-wrap">
      <svg className="progress-ring" viewBox="0 0 300 300" role="img" aria-label={`${Math.round(clamped * 100)}% time remaining`}>
        <circle className="progress-ring-track" cx="150" cy="150" r={radius} />
        <circle
          className="progress-ring-value"
          cx="150"
          cy="150"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="progress-ring-content">{children}</div>
    </div>
  )
}
