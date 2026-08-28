# Smart Study Timer — Project Guide

This guide explains the final audited project in simple but technically correct language. It is written so a university student can understand the code, demonstrate the application, modify it, and answer common viva questions.

## 1. What the project does

Smart Study Timer is a frontend productivity web application based on the Pomodoro study method. It provides three timer modes:

- Study = 25 minutes by default
- Short Break = 5 minutes by default
- Long Break = 15 minutes by default

The user can start, pause, resume, reset, or skip a session. The application tracks completed Study sessions, focus minutes, progress toward a Long Break, settings, theme, sound preference, optional notification preference, and active timer state.

Only a Study timer that finishes naturally is counted as a completed focus session. Reset, Skip, break completion, and manual mode changes do not create fake Study completions.

## 2. Why it was created

Students often study for long periods without structured recovery. The Pomodoro technique creates a simple rhythm: focused work, short recovery, repeated focus, then a longer recovery.

This project turns that idea into a polished portfolio application. It demonstrates practical frontend skills such as React state management, browser storage, timer accuracy, responsive layout, accessibility, browser APIs, and defensive handling of bad saved data.

## 3. Technologies used

### React

React builds the user interface from reusable components. It also manages changing state such as the timer, settings, theme, modal visibility, and statistics.

### Vite

Vite is the development server and production build tool. `npm run dev` starts the local development environment and `npm run build` creates optimized production files.

### JavaScript

JavaScript handles timer calculations, Pomodoro rules, settings validation, statistics, keyboard shortcuts, browser title updates, storage, sound, and notifications.

### Modern CSS

CSS controls the complete visual system: Light/Dark themes, responsive layout, cards, buttons, progress ring, settings dialog, focus states, transitions, and mobile adaptation.

### Lucide React

Lucide React supplies consistent SVG icons such as Play, Pause, Reset, Skip, Settings, Theme, Sound, and Notification icons.

### localStorage

`localStorage` saves small pieces of information in the browser so data survives refreshes and browser restarts on the same site/browser.

### Web Audio API

The app generates its completion tone in the browser. It does not depend on a remote MP3 URL.

### Web Notifications API

Browser notifications are optional. Permission is requested only after the user clicks the notification setting.

## 4. Why React was used

The application has many pieces of state that affect the UI:

- current timer mode
- remaining seconds
- running/paused state
- Study/Break durations
- Auto-start option
- Light/Dark theme
- sound setting
- notification setting
- daily statistics
- Long Break cycle progress
- toast messages
- settings-dialog state

React makes these state changes predictable. When state changes, React updates only the required interface. Components also prevent the whole application from becoming one large, difficult file.

## 5. Why no backend or database was needed

The project is designed for one person using one browser. It does not require login, shared accounts, cloud synchronization, server-side calculations, or multi-user data.

For this scope, a backend would add unnecessary complexity. `localStorage` is enough for the small amount of persistent data.

Therefore the project intentionally uses no MySQL, MongoDB, Firebase, Supabase, PostgreSQL, SQLite, or other external database.

## 6. What localStorage is

`localStorage` is browser-based key/value storage. A value remains after refresh and normally remains after closing/reopening the browser until the user clears site data.

Objects are saved as JSON text:

```js
localStorage.setItem('example', JSON.stringify({ value: 10 }))
```

They are read back with JSON parsing:

```js
JSON.parse(localStorage.getItem('example'))
```

This project wraps those operations in safe helper functions so malformed JSON does not crash the app.

## 7. What information is saved in localStorage

The project uses these keys.

### `smartStudyTimer.settings`

Stores:

- Study duration
- Short Break duration
- Long Break duration
- Auto-start option

### `smartStudyTimer.theme`

Stores `light` or `dark`.

### `smartStudyTimer.soundEnabled`

Stores whether completion sound is enabled.

### `smartStudyTimer.notificationsEnabled`

Stores the user's notification preference. Actual notifications still require browser permission.

### `smartStudyTimer.dailyStats`

Stores completed Study sessions and Focus Minutes using a local calendar date key.

Example:

```js
{
  "2026-08-12": {
    "sessions": 3,
    "focusMinutes": 90
  },
  "2026-08-13": {
    "sessions": 1,
    "focusMinutes": 30
  }
}
```

Because each date has a different key, today's count does not accidentally become yesterday's count.

### `smartStudyTimer.timerState`

Stores the active timer information:

- mode
- remaining seconds
- running status
- target finish timestamp
- cycle progress
- session duration used for that timer

This is what allows a running timer to recover accurately after refresh.

## 8. Complete file/folder explanation

```text
smart-study-timer-final/
├── scripts/
│   └── audit.mjs
├── src/
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── README.md
├── PROJECT_GUIDE.md
└── vite.config.js
```

### `src/components/`

Contains reusable UI components such as the timer card, buttons, progress ring, statistics, theme toggle, settings dialog, and toast.

### `src/hooks/`

Contains reusable React logic. `useTimer.js` is the main timer hook. `useLocalStorage.js` connects React state with browser storage.

### `src/utils/`

Contains pure/helper logic:

- `timerUtils.js` — timer constants, settings validation, time/date formatting, Pomodoro next-mode rules
- `storageUtils.js` — safe storage reads/writes
- `statsUtils.js` — daily-stat sanitization and completed-session updates
- `audioUtils.js` — Web Audio initialization and completion tone

### `src/styles/`

- `globals.css` — theme variables, global typography, focus styles, reduced-motion behavior
- `app.css` — layout, components, responsive rules, modal, timer ring, controls

### `scripts/audit.mjs`

A dependency-free Node audit script that checks core utility behavior and source hygiene.

### `App.jsx`

The main application coordinator. It connects persistent data, timer logic, statistics, sound, notifications, keyboard shortcuts, date rollover, theme, and the component layout.

### `main.jsx`

Creates the React root and renders `<App />`.

### `index.html`

The page shell used by Vite. It also contains a small early-theme script so the correct theme can be applied before React mounts, reducing theme flash.

### `vite.config.js`

Enables the Vite React plugin.

### `package.json`

Contains exact top-level dependency versions, npm scripts, and the supported Node engine range.

## 9. App.jsx responsibility

`App.jsx` coordinates the whole application but does not contain the detailed countdown algorithm.

Its responsibilities include:

- reading/sanitizing settings
- reading/sanitizing theme and preference values
- reading daily statistics
- recording a successfully completed Study session
- connecting `useTimer`
- playing completion sound
- sending optional browser notifications
- displaying toasts
- applying Light/Dark theme
- updating the browser tab title
- detecting local-date rollover
- syncing notification permission
- handling Space/R/S keyboard shortcuts
- opening/closing Settings
- arranging the main dashboard components

## 10. Main components and their responsibility

### `Header.jsx`

Displays the brand, theme toggle, and Settings button.

### `ThemeToggle.jsx`

Switches Light/Dark mode and provides an accessible button label.

### `TimerCard.jsx`

The main visual timer area. It combines Mode Selector, Progress Ring, Timer Display, and Timer Controls.

### `ModeSelector.jsx`

Lets the user manually choose Study, Short Break, or Long Break. Manual switching resets the selected mode's timer and stops running state, but it never increases completed Study sessions.

### `ProgressRing.jsx`

Draws an SVG circular progress indicator using the percentage of time remaining.

### `TimerDisplay.jsx`

Shows the session type, `MM:SS` value, and status such as Ready, Paused, or Stay focused.

### `TimerControls.jsx`

Contains Reset, Start/Pause/Resume, and Skip controls.

### `StatsPanel.jsx`

Shows:

- Today's Sessions
- Focus Minutes
- Long Break Progress
- Next expected session

### `SessionProgress.jsx`

Shows progress from 0 to 4 completed Study sessions toward the next Long Break.

### `SettingsModal.jsx`

Contains custom durations, Auto-start, sound, notifications, Save Settings, and Reset Defaults.

The audited version also:

- validates values before save
- blocks non-numeric duration characters
- traps keyboard focus inside the open dialog
- supports Escape to close
- restores focus to the previous control when closed
- prevents background page scrolling while open

### `Toast.jsx`

Shows a non-blocking internal status/completion message.

### `KeyboardHelp.jsx`

Displays Space, R, and S shortcuts.

## 11. Timer logic explanation

The main countdown logic is in:

```text
src/hooks/useTimer.js
```

Important timer state:

```text
mode
remainingSeconds
isRunning
targetEnd
cycleProgress
sessionDurationMinutes
```

The important design decision is `targetEnd`.

Example:

```text
Current time = 10:00:00
Study duration = 25 minutes
Target end = 10:25:00
```

The timer does not trust an interval to fire exactly once every second. Instead it recalculates:

```text
remaining = ceil((targetEnd - currentTime) / 1000)
```

That makes the timer much more accurate when a tab becomes inactive.

## 12. setInterval / timer handling

A single interval exists only while `isRunning === true`.

The interval checks about every 250 ms. It does not mean the timer loses 250 ms at each step. The real remaining time always comes from `targetEnd - Date.now()`.

When the timer is paused or the component effect changes, cleanup runs:

```js
clearInterval(intervalId)
```

Repeated Start clicks cannot create stacked intervals because Start returns the existing state when the timer is already running.

## 13. Start logic

When Start is used:

1. If already running, do nothing.
2. Use the current remaining seconds.
3. Create `targetEnd = Date.now() + remaining * 1000`.
4. Set `isRunning = true`.
5. The interval begins refreshing the display.

The App also primes Web Audio from this user interaction when sound is enabled. That improves the chance that the completion sound is permitted later.

## 14. Pause logic

When Pause is pressed:

1. Read the current target timestamp.
2. Calculate the newest remaining seconds from the real clock.
3. If the timer has already reached the finish moment, run completion logic instead of creating a false paused-at-zero state.
4. Otherwise save the remaining seconds.
5. Set `isRunning = false`.
6. Clear `targetEnd`.
7. React effect cleanup removes the interval.

## 15. Resume logic

Resume uses the same Start function.

Example:

```text
Paused at 12:40
Resume pressed
New targetEnd = current time + 12 minutes 40 seconds
```

The timer continues from the paused amount instead of restarting from the full duration.

## 16. Reset logic

Reset:

- stops the timer
- removes target timestamp
- restores the configured duration for the current mode
- keeps Pomodoro cycle progress unchanged
- does not count a Study completion

Example: resetting a Study session at `08:12` returns it to the configured Study duration and does not change Today's Sessions.

## 17. Skip logic

Skip:

- stops the current timer
- does not mark an unfinished Study session as completed
- selects the next logical mode
- loads the full configured duration of that next mode

If Long Break is skipped, cycle progress resets to zero because that Long Break stage has been passed.

## 18. Pomodoro cycle calculation

`cycleProgress` is the number of successful Study sessions toward the next Long Break.

```text
0 → 1 → 2 → 3 → 4
```

Flow:

```text
Study #1 complete → Short Break
Short Break complete → Study
Study #2 complete → Short Break
Short Break complete → Study
Study #3 complete → Short Break
Short Break complete → Study
Study #4 complete → Long Break
Long Break complete → Study and cycle resets to 0
```

`getNextMode()` in `timerUtils.js` performs the main next-mode decision.

Important rule: cycle progress increases only inside natural Study completion logic.

## 19. Daily session counter logic

Daily-stat helpers are in:

```text
src/utils/statsUtils.js
```

When a Study session completes naturally:

1. Get the current local calendar date using `getDateKey()`.
2. Read/sanitize current daily statistics.
3. Add 1 to that date's `sessions` value.
4. Add the completed Study duration to that date's `focusMinutes`.
5. Save the updated object through `useLocalStorage`.

Reset, Skip, breaks, and manual mode changes never call this Study-completion recorder.

## 20. Custom settings logic

Allowed ranges:

```text
Study:       1–120 minutes
Short Break: 1–60 minutes
Long Break:  1–90 minutes
```

The Settings dialog accepts digit characters and allows an empty field temporarily while editing. Before Save, `validateSettings()` rejects:

- empty value
- zero
- negative value
- non-integer value
- value below minimum
- value above maximum
- invalid numeric content

The audited test values are valid:

```text
Study = 30
Short Break = 7
Long Break = 20
```

If durations are changed while a timer is running, the current running session keeps its original duration. New values apply to the next reset/session.

## 21. Theme logic

Theme values are CSS variables in `src/styles/globals.css`.

Examples:

```css
--bg
--surface
--text
--text-soft
--border
--accent
```

The root element receives:

```text
data-theme="light"
```

or:

```text
data-theme="dark"
```

The Dark theme has a separately designed palette instead of simple inversion.

The saved theme is also applied in `index.html` before React renders. This reduces the common flash where a saved Dark theme briefly displays a Light background.

## 22. Sound alert logic

Sound helpers are in:

```text
src/utils/audioUtils.js
```

The application creates a gentle two-tone sound using Web Audio oscillators and a gain envelope.

Important behavior:

- no external audio URL
- no API key
- sound preference is stored
- AudioContext is primed from Start or Sound-ON interaction when possible
- suspended AudioContext is resumed safely
- failed/blocked audio never crashes timer completion

The visual toast remains the fallback even when sound cannot play.

## 23. Circular progress calculation

The progress ring receives:

```text
progress = remainingSeconds / totalSeconds
```

The value is clamped between 0 and 1.

For an SVG circle:

```text
circumference = 2 × π × radius
```

The component converts progress into `strokeDashoffset`. As time decreases, the visible accent part of the circle decreases smoothly.

## 24. How data persists after refresh

Settings, theme, sound preference, notification preference, and statistics are loaded directly from localStorage.

For a running timer, `targetEnd` is the most important value.

Example:

```text
Timer target = 10:25:00
Page refreshed = 10:08:30
Recovered remaining = 16:30
```

The app recalculates from the clock instead of trusting the previously displayed number.

If the target time passed while the page was closed, the restored running session safely completes on initialization. The remaining value is clamped so it never becomes negative.

Saved timer values are also sanitized/clamped so obviously corrupted durations/progress cannot produce an uncontrolled timer value.

## 25. Important React hooks used

### `useState`

Stores changing UI/timer values.

Examples:

- timer object
- date key
- modal open/closed
- toast message
- notification permission

### `useEffect`

Handles side effects:

- timer interval lifecycle
- timer-state persistence
- theme application
- browser title updates
- local-date rollover scheduling
- notification-permission synchronization
- keyboard event listener
- toast timeout
- dialog focus/scroll behavior

### `useCallback`

Keeps event-handler functions stable where useful, especially functions passed into hooks/components.

### `useMemo`

Used for sanitized settings and statistics so derived objects do not need to be recalculated unnecessarily.

### `useRef`

Used for values that must survive renders without causing another render.

Examples:

- latest timer state
- completion lock
- previous settings
- Settings dialog DOM reference
- first input reference
- previously focused element

## 26. How responsive design works

Responsive rules are mainly in:

```text
src/styles/app.css
```

Important widths include approximately:

- 1024px
- 820px
- 680px
- 390px

Desktop uses a wide dashboard with Timer and supporting information side by side.

At tablet/mobile sizes, the layout deliberately changes order:

```text
Hero → Timer → Statistics → Supporting cards
```

This keeps the timer visible earlier instead of forcing the user to scroll through statistics first.

Other mobile changes:

- statistics stack vertically
- timer ring scales down
- touch controls stay large
- secondary Reset/Skip text can hide while `aria-label` remains
- side cards become one column
- settings fields become one column
- settings dialog uses viewport-safe height and scrolling
- footer stacks
- very narrow screens shorten nonessential hero content

## 27. Important edge cases handled

### Repeated Start clicks

No duplicate running interval is created.

### Reset while running

Stops and restores the timer without counting Study completion.

### Skip while running

Moves forward without counting an unfinished Study session.

### Settings changed while running

Current countdown remains stable. New settings apply later.

### Manual mode switching

Stops/reset-selects that mode but does not create a completed session.

### Browser refresh

Running timer is rebuilt from target timestamp.

### Corrupted localStorage JSON

Storage helpers return safe fallbacks.

### Semantically bad stored settings

Sanitizers keep valid fields and replace invalid fields with safe defaults.

### Corrupted timer snapshot

Mode, cycle progress, duration, and remaining-time values are validated/clamped before use.

### Sound blocked

Audio failure is ignored safely and toast feedback still appears.

### Browser tab becomes inactive

Countdown is calculated from real timestamps, reducing drift from throttled intervals.

### Timer reaches exactly `00:00`

Remaining time is clamped to zero and completion is protected by a completion lock.

### Pause exactly around completion

Pause recalculates from `targetEnd`; if the finish moment already passed, completion logic runs instead of leaving a paused zero timer.

### Calendar date changes

The app schedules a local-midnight refresh and also checks again on focus/visibility changes. The new date reads a separate daily-stat record.

### Invalid settings input

Save is blocked and a field error is shown.

### Settings dialog open

Timer continues, but global timer shortcuts are disabled. Focus stays inside the dialog until it closes.

## 28. How to run the application

Open the final project folder in VS Code.

Run:

```bash
npm install
npm run dev
```

Use the URL printed by Vite, normally:

```text
http://localhost:5173
```

## 29. How to build the project

Run:

```bash
npm run build
```

Vite generates:

```text
dist/
```

Preview the production build with:

```bash
npm run preview
```

A separate core audit can be run with:

```bash
npm run audit
```

## 30. How to modify timer defaults

Open:

```text
src/utils/timerUtils.js
```

Find:

```js
export const DEFAULT_SETTINGS = {
  study: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStart: false,
}
```

Change the numbers while keeping them inside the allowed limits.

If you also want different allowed ranges, edit `DURATION_LIMITS` in the same file.

## 31. How to change colors/design

Open:

```text
src/styles/globals.css
```

Change theme variables under:

```css
:root { ... }
:root[data-theme='dark'] { ... }
```

For layout and component styling, edit:

```text
src/styles/app.css
```

Important classes:

```text
.dashboard
.timer-card
.mode-selector
.progress-ring-wrap
.timer-controls
.stats-panel
.session-progress-card
.settings-modal
.toast
```

## 32. Common errors and fixes

### `npm` is not recognized

Node.js/npm is not correctly installed or PATH is missing.

Check:

```bash
node -v
npm -v
```

### Node engine warning

Use a Node version compatible with the `engines` field in `package.json`.

### PowerShell blocks `npm.ps1`

Use Command Prompt/Git Bash, or run:

```text
npm.cmd install
npm.cmd run dev
```

### Port 5173 is already busy

Use the alternative local URL printed by Vite.

### Old or broken preferences appear

Open browser developer tools and remove keys beginning with:

```text
smartStudyTimer.
```

Then refresh.

### Browser notification does not appear

Check the site's notification permission. Notifications are optional; the in-app toast continues to work.

### Sound does not play

Some browsers restrict audio until the page has received a user interaction. Click Start or enable Sound from Settings. The timer itself remains fully functional even if the browser blocks audio.

### `npm install` cannot reach the registry

Check internet/DNS/proxy/firewall settings and try again. Dependency installation requires access to the npm registry unless packages are already cached.

## 33. Possible viva questions and short answers

### Q1. What is Smart Study Timer?

It is a frontend Pomodoro productivity application with Study, Short Break, and Long Break timers, daily progress tracking, settings, themes, and local persistence.

### Q2. Which framework did you use?

React.

### Q3. What is Vite used for?

Vite provides the development server and production build process.

### Q4. Why did you use React?

Because the UI has many connected state changes, and React makes state-driven rendering and reusable components easier to manage.

### Q5. Did you use a backend?

No. This project is intentionally frontend-only.

### Q6. Which database did you use?

No external database. I used browser localStorage for small persistent data.

### Q7. Why is localStorage enough here?

The app stores only one browser user's preferences, timer state, and small daily statistics. It does not need shared cloud data.

### Q8. Where is the main timer logic?

`src/hooks/useTimer.js`.

### Q9. Where are timer constants and validation rules?

`src/utils/timerUtils.js`.

### Q10. How do you prevent timer drift?

I store an absolute target finish timestamp and calculate remaining time from `targetEnd - Date.now()`.

### Q11. Why not just subtract 1 every second?

Inactive browser tabs can throttle intervals. A timestamp-based calculation stays closer to real elapsed time.

### Q12. How do you prevent multiple intervals?

Start does nothing when already running, and the React effect cleans up the previous interval with `clearInterval`.

### Q13. How does Pause work?

It calculates the newest remaining time from the target timestamp, saves that value, stops running state, and removes the target timestamp.

### Q14. How does Resume work?

It creates a new target timestamp using the saved paused remaining seconds.

### Q15. Does Reset count a Study session?

No.

### Q16. Does Skip count a Study session?

No, not for an unfinished Study timer.

### Q17. Does a completed break increase Today's Sessions?

No.

### Q18. Does manual mode switching count a session?

No.

### Q19. When does Today's Sessions increase?

Only when a Study timer naturally finishes.

### Q20. How do you get Long Break?

After the fourth successful Study completion, cycle progress reaches 4 and the next mode becomes Long Break.

### Q21. What happens after Long Break?

The app returns to Study and resets Long Break cycle progress to zero.

### Q22. How are Focus Minutes calculated?

When a Study session completes, its session duration is added to that date's focus-minute total.

### Q23. How are yesterday and today separated?

Daily statistics use local date keys like `2026-08-12` and `2026-08-13`.

### Q24. What happens at midnight?

The app refreshes the current date key at local midnight and also checks after returning to the tab/window.

### Q25. How does the running timer survive refresh?

The app saves `targetEnd` in localStorage and recalculates remaining time after reload.

### Q26. How do you handle corrupted localStorage?

Reads are wrapped in `try/catch`, and settings, booleans, themes, timer values, and statistics are sanitized before use.

### Q27. How does theme persistence work?

The selected theme is stored in localStorage and applied as a `data-theme` attribute. `index.html` applies it early to reduce theme flash.

### Q28. How is the circular progress ring calculated?

`remainingSeconds / totalSeconds` gives the progress fraction, which is converted to SVG `strokeDashoffset`.

### Q29. How does sound work?

The Web Audio API creates a local two-tone sound. Audio is primed after user interaction and failures are handled safely.

### Q30. Are browser notifications required?

No. They are optional and permission is requested only from a user action.

### Q31. What keyboard shortcuts exist?

Space for Start/Pause/Resume, R for Reset, and S for Skip.

### Q32. Why do shortcuts not run inside Settings?

The app disables global timer shortcuts while the dialog is open and while the user is typing, preventing accidental timer actions.

### Q33. What accessibility improvements are included?

Semantic buttons, accessible labels, visible focus states, reduced-motion support, keyboard shortcuts, a focus-trapped Settings dialog, focus restoration, and non-blocking status announcements.

### Q34. What makes the layout responsive?

CSS Grid, flexible sizing, viewport-aware timer dimensions, and media queries reorganize content for tablet/mobile widths.

### Q35. Why is the timer shown before statistics on small screens?

The timer is the application's primary task. Reordering it earlier improves mobile usability and prevents secondary content from pushing it too far down the page.

### Q36. How can you test the core utilities without opening the browser?

Run `npm run audit`. The included Node script checks timer utility behavior, settings validation, Pomodoro mode rules, date-scoped statistics, storage fallbacks, and source hygiene.

### Q37. How do you run the project?

`npm install` and then `npm run dev`.

### Q38. How do you build it?

`npm run build`.

### Q39. Where do you change timer defaults?

`src/utils/timerUtils.js` inside `DEFAULT_SETTINGS`.

### Q40. Where do you change the colors?

Theme variables are in `src/styles/globals.css`; component/layout styles are in `src/styles/app.css`.
