let audioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return null

  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContextClass()
  }

  return audioContext
}

export function primeCompletionAudio() {
  try {
    const context = getAudioContext()
    if (!context) return false

    if (context.state === 'suspended') {
      const resumeResult = context.resume()
      if (resumeResult?.catch) resumeResult.catch(() => {})
    }

    return true
  } catch {
    return false
  }
}

export async function playCompletionTone() {
  try {
    const context = getAudioContext()
    if (!context) return false

    if (context.state === 'suspended') {
      await context.resume().catch(() => {})
    }

    if (context.state !== 'running') return false

    const now = context.currentTime
    const gain = context.createGain()
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72)
    gain.connect(context.destination)

    const first = context.createOscillator()
    const second = context.createOscillator()

    first.type = 'sine'
    second.type = 'sine'
    first.frequency.setValueAtTime(659.25, now)
    second.frequency.setValueAtTime(880, now + 0.2)

    first.connect(gain)
    second.connect(gain)

    first.start(now)
    first.stop(now + 0.34)
    second.start(now + 0.2)
    second.stop(now + 0.74)

    return true
  } catch {
    return false
  }
}
