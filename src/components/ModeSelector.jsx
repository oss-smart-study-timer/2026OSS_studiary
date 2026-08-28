import { MODES } from '../utils/timerUtils'

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="mode-selector" role="group" aria-label="Timer mode">
      {Object.values(MODES).map((item) => (
        <button
          type="button"
          key={item.key}
          className={mode === item.key ? 'active' : ''}
          onClick={() => onChange(item.key)}
          aria-pressed={mode === item.key}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
