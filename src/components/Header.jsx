import { BrainCircuit, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header({ theme, onToggleTheme, onOpenSettings }) {
  return (
    <header className="topbar">
      <a className="brand" href="#main" aria-label="Smart Study Timer home">
        <span className="brand-mark" aria-hidden="true"><BrainCircuit size={21} /></span>
        <span>
          <strong>Smart Study Timer</strong>
          <small>Focus with intention</small>
        </span>
      </a>

      <div className="topbar-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button
          className="icon-text-button"
          type="button"
          onClick={onOpenSettings}
          aria-label="Open timer settings"
          title="Settings"
        >
          <Settings size={18} aria-hidden="true" />
          <span>Settings</span>
        </button>
      </div>
    </header>
  )
}
