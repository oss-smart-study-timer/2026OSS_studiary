# Smart Study Timer

A polished, frontend-only Pomodoro productivity dashboard built with React and Vite. Smart Study Timer helps students run focused study sessions, take intentional breaks, track daily progress, and keep preferences across refreshes without accounts, a backend, or an external database.

## Project Overview

Smart Study Timer uses three timer modes:

- **Study:** 25 minutes by default
- **Short Break:** 5 minutes by default
- **Long Break:** 15 minutes by default

After four successfully completed Study sessions, the next break becomes a Long Break. Users can customize all durations, enable Auto-start, switch themes, control completion sound, optionally enable browser notifications, and use keyboard shortcuts.

The app is local-first: persistent data is stored in browser `localStorage` and no server is required.

## Features

- Timestamp-based countdown designed to resist hidden-tab timer drift
- Study, Short Break, and Long Break modes
- Start, Pause/Resume, Reset, and Skip controls
- Four-focus-session Pomodoro cycle with Long Break progression
- Daily completed-focus-session counter
- Daily focus-minute tracking based on completed Study session duration
- Date-aware statistics so a new calendar day starts with a fresh Today view
- Circular SVG progress ring
- Custom duration settings with strict validation
- Auto-start next session option
- Persistent Light and Dark themes
- Early theme boot to reduce theme flash during page load
- Persistent sound preference
- Locally generated Web Audio completion tone
- Audio priming on user interaction for better browser-policy compatibility
- Optional browser notifications requested only after user action
- In-app completion/status toasts
- Dynamic browser tab title while the timer runs
- Keyboard shortcuts: Space, R, and S
- Safe fallbacks for missing, malformed, or semantically invalid stored data
- Running timer restoration after refresh using a target finish timestamp
- Responsive layouts intentionally reordered for tablet/mobile so the timer stays prominent
- Accessible dialog focus handling, keyboard-visible focus states, semantic controls, and reduced-motion support

## Screenshots

Add portfolio screenshots here after running the project locally.

Recommended captures:

1. Desktop Light theme
2. Desktop Dark theme
3. Settings dialog
4. Tablet layout
5. Mobile timer view

## Technology Stack

- React
- Vite
- JavaScript (ES Modules)
- Modern CSS
- Lucide React
- Browser `localStorage`
- Web Audio API
- Web Notifications API (optional)

## Project Structure

```text
smart-study-timer-final/
├── scripts/
│   └── audit.mjs
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── KeyboardHelp.jsx
│   │   ├── ModeSelector.jsx
│   │   ├── ProgressRing.jsx
│   │   ├── SessionProgress.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── StatsPanel.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── TimerCard.jsx
│   │   ├── TimerControls.jsx
│   │   ├── TimerDisplay.jsx
│   │   └── Toast.jsx
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useTimer.js
│   ├── styles/
│   │   ├── app.css
│   │   └── globals.css
│   ├── utils/
│   │   ├── audioUtils.js
│   │   ├── statsUtils.js
│   │   ├── storageUtils.js
│   │   └── timerUtils.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── PROJECT_GUIDE.md
├── README.md
└── vite.config.js
```

## Installation

Use a Node.js version compatible with the `engines` field in `package.json`, then open the project folder in VS Code and run:

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Vite normally serves the project at:

```text
http://localhost:5173
```

If that port is already occupied, use the exact local URL printed by Vite.

## Build for Production

```bash
npm run build
npm run preview
```

The production build is generated in `dist/`.

## Local Audit Command

A dependency-free Node audit script is included for core pure logic and source-hygiene checks:

```bash
npm run audit
```

It checks duration conversion, `MM:SS` formatting, settings validation, Pomodoro next-mode rules, daily date-scoped statistics, malformed `localStorage` fallback behavior, required project files, and source hygiene.

## How the Timer Works

The running timer stores an absolute `targetEnd` timestamp instead of relying on subtracting exactly one second on every interval callback.

While running:

```text
remaining seconds = ceil((targetEnd - Date.now()) / 1000)
```

A lightweight interval refreshes the display, but the real clock determines the remaining time. This prevents common timer drift when the browser throttles inactive tabs.

Pause calculates the latest remaining time and removes the target timestamp. Resume creates a new target timestamp from the saved remaining seconds.

## Pomodoro Logic

A Study session counts only when it reaches `00:00` naturally.

Normal sequence:

```text
Study → Short Break → Study → Short Break → Study → Short Break → Study → Long Break
```

Rules:

- Reset does not count a Study completion.
- Skip does not count an unfinished Study session.
- Break completion does not increase the Study counter.
- Manual mode switching does not create a completed Study session.
- The fourth successful Study completion unlocks Long Break.
- Finishing or skipping Long Break resets cycle progress to zero.

## localStorage Usage

The application uses these keys:

```text
smartStudyTimer.settings
smartStudyTimer.theme
smartStudyTimer.soundEnabled
smartStudyTimer.notificationsEnabled
smartStudyTimer.dailyStats
smartStudyTimer.timerState
```

Stored values are parsed through safe helpers. Settings, booleans, themes, timer state, and daily statistics are sanitized before use so malformed data cannot crash the application.

## Theme System

Light and Dark themes have dedicated design tokens in `src/styles/globals.css` rather than a simple color inversion.

The theme preference is stored in `localStorage`. A small script in `index.html` applies the saved/system theme before React mounts, which reduces incorrect-theme flashing during startup.

## Custom Settings

The Settings dialog supports:

- Study: 1–120 minutes
- Short Break: 1–60 minutes
- Long Break: 1–90 minutes
- Auto-start next session
- Completion sound
- Optional browser notifications

Duration inputs accept numeric characters only and are validated again before saving. The requested test values `30 / 7 / 20` are supported.

Changing durations does not interrupt an already-running timer. New durations apply on the next reset/session.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Start / Pause / Resume |
| `R` | Reset current timer |
| `S` | Skip current session |

Shortcuts are disabled while the Settings dialog is open and while the user is typing in an input, textarea, select, or editable element.

## Responsive Design

The UI is designed for desktop, laptop, tablet, and mobile widths.

Key behaviors include:

- Desktop uses a two-column timer/support dashboard.
- At tablet/mobile widths the timer moves ahead of secondary statistics.
- Statistics stack cleanly on narrow screens.
- The progress ring scales with viewport width.
- Secondary control text can collapse while accessible labels remain.
- The Settings dialog becomes a single-column, scroll-safe layout.
- Mobile footer and supporting cards stack without horizontal overflow.

## Browser Compatibility

The core timer is intended for current evergreen browsers. Browser notifications depend on browser/platform permission support. Web Audio may be restricted until the page receives a user interaction; the app primes audio from timer/sound interactions and safely falls back to the visual toast if sound remains blocked.

## Future Improvements

Possible extensions:

- Optional task/session labels
- Weekly focus charts
- Export/import of local statistics
- Multiple accessible completion tones
- Installable PWA support
- Optional distraction checklist
- Local history view with per-day summaries
