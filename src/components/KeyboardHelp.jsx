import { Keyboard } from 'lucide-react'

export default function KeyboardHelp() {
  return (
    <div className="keyboard-help" aria-label="Keyboard shortcuts">
      <span><Keyboard size={16} aria-hidden="true" /> Shortcuts</span>
      <span><kbd>Space</kbd> Start/Pause</span>
      <span><kbd>R</kbd> Reset</span>
      <span><kbd>S</kbd> Skip</span>
    </div>
  )
}
