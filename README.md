# Clubstride Lite — Tactical Pitch & Live Rotations PWA

[![Web App](https://img.shields.io/badge/Web%20App-Visit-blue)](https://FracturedOrbit1980.github.io/Clubstride-Mobile/)

**Clubstride Lite** is an offline-first Progressive Web App (PWA) designed specifically for grassroots soccer coaches. It runs completely locally in the browser on desktop, tablet, or mobile phone, requiring zero backend server, zero login, and no internet connection during match day.

Hosted live on GitHub Pages: [https://FracturedOrbit1980.github.io/Clubstride-Mobile/](https://FracturedOrbit1980.github.io/Clubstride-Mobile/)

---

*Site rebuild trigger – $(Get-Date -Format o)*

## 🚀 Key Features

### 1. 🎨 Clubstride CI (v1.0.0) Look & Feel
- **Design Tokens:** Every colour, radius and font comes from `clubstride-tokens.css` (`[data-surface='lite']` navy shell with `#22D3EE` primary, `#3BE38A` go, `#C8F230` accent, `#FF8A80` danger; `[data-surface='match']` goal/assist/sub tints).
- **Button Variants:** Primary (Start, Save, End match), Secondary (tinted slate), Danger (red gradient), and Ghost (transparent with subtle border).
- **Cards & Bottom Sheets:** CI radius scale (`rounded-ci-*`, `rounded-lite`, `rounded-lite-xl`, `rounded-pill`) with layered soft shadows, generous padding, and mobile bottom-sheet modals sliding up on phones.
- **Icons:** Inline 24×24 line-icon SVG sprite (`#ci-*`, stroke 2, round caps, `currentColor`) — no emoji in the UI. Sub in/out chips use the fixed-gradient `SubBadge` components; the Clubstride Lite (L1) lockup is used in the header, PDF letterhead and app icons.
- **Pitch & Tokens:** Striped grass pitch pattern, rounded corners, crisp lines, circular player tokens with soft shadows, shirt numbers, and smooth token movement animations when changing formations.
- **Tabular Numbers:** Timers, scores, and match statistics use tabular numerals (`tabular-nums`) to prevent text jumping.
- **Offline Tailwind CSS:** Built and minified local CSS (`tailwind.min.css`) with zero runtime CDN script dependency for 100% offline reliability.

### 2. 📋 Tactical Pitch & Formations Engine
- **Preset Formations Dropdown:** Formations curated for each match format:
  - **5v5:** 1-2-1, 2-1-1, 2-2, 1-1-2, 3-1
  - **7v7:** 2-3-1, 3-2-1, 3-1-2, 2-2-2, 1-3-2, 2-1-2-1
  - **9v9:** 3-3-2, 3-2-3, 2-4-2, 3-4-1, 4-3-1, 3-1-3-1
  - **11v11:** 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2, 4-1-4-1, 4-5-1
- **Goalkeeper Guarantee:** The goalkeeper is always positioned in the goal area ($y \approx 88\text{--}90\%$).
- **Position-Based Sorting:** One-tap sort lines up starters by position (GK → DEF → MID → FWD).
- **Custom Formations:** Coaches can drag players anywhere on the pitch and save custom formations with custom names.
- **Formation Persistence:** Chosen formations persist per team and in archived match history.

### 3. ⏱️ Live Match Console & Rotations Engine
- **Digital Stopwatch:** Play/pause, reset, and half management (1st Half / 2nd Half).
- **One-Tap Tactical Sub Board:** Tap a player on the field to sub out, then tap a bench reserve to swap in.
- **Live Playing Timers:** Only players on the field accumulate time, and minutes are credited from real elapsed wall-clock time—so a backgrounded or sleeping phone still awards the missing seconds when it wakes (substitutions move the accrual to the incoming player from the next second).
- **Live Stats Sync:** Starting the clock adds the live match to the pulled totals, and the Stats screen refreshes every 5 seconds while the match runs. **End match** carries that selection onto the archived fixture so totals keep covering the game that was just played.
- **Scoreboard with Touch Steppers:** Rounded `+` and `−` score adjustment buttons for both teams.
- **Goal & Assist Logger:** One **"+ Goal"** popup records the goal and its setup together: pick the scorer, then an optional assister. Both lists show only players currently on the pitch, the scorer is removed from the assist list, a goal is never logged without choosing the scorer, and an assist can never exist without a goal.
- **Timeline & Instant Undo:** Event log showing goals, their linked assists, and substitutions with one-tap `✕ Undo`. Undoing a goal removes the assist attached to it.
- **🏁 End Match Workflow:** Confirmation popup before saving completed matches (date, score, formation, player minutes, goals, assists, substitutions, timeline) into **Match History** and resetting stopwatch, score, and live timers ready for the next game.

### 4. 👥 Squad Registry & Team Management
- Add and edit squad members (full name, jersey number 1–99, tactical position).
- Mark pre-game availability (Available vs Out).
- Save multiple teams with custom names, kit colors, formations, and club badge logos.

### 5. 📊 Playing Time Reporting & Game Analytics
- **Multi-Select Games:** Select multiple games from match history or pull all matches to calculate cumulative minutes.
- **Tamper-Proof Time Tracking:** Playing time is strictly tracked from the live match clock and substitutions—no manual minute tampering allowed.
- **Game Detail Breakdown:** Expandable match fixtures with official playing time and chronological event timeline.

### 6. 📄 Dual-Mode PDF Reports (Single Match & Date Range)
Accessible via the **"Create PDF report"** button on the Stats screen and on each match in match history:
- **Single Match PDF:**
  - Header: Team Name, Opponent, Date, Match Format, Formation, Final Score, Duration.
  - Complete Player Table: Minutes on pitch, minutes on bench, goals, assists, subs in/out, starter/bench.
  - Match Timeline: Goals, assists, and substitutions with match times.
  - Clean A4 portrait format, rounded headers, brand emerald theme, footer with page numbers and generation date.
  - File name: `Clubstride_<Team>_<Opponent>_<YYYY-MM-DD>.pdf`.
- **Date Range PDF:**
  - Quick Date Presets: **Last 7 days**, **This month**, **This season**, **All time**, plus custom date inputs and team filter.
  - Record Summary: Total matches, Wins, Draws, Losses, Goals For (GF), Goals Against (GA), Goal Difference.
  - Matches List: Fixture dates, opponents, formats, scores, and W/D/L results.
  - Player Totals Table: Summed across all matches in the range. Includes all squad members (showing 0 if no appearances so coaches spot unfair playing time).
  - Sorted by minutes played (highest first) with a totals row at the bottom.
  - Highlights: Top Scorer, Top Assists, Most Mins.
  - File name: `Clubstride_<Team>_<From>_to_<To>.pdf`.
  - Friendly notification if no matches fall in the chosen date range.

### 7. 💾 100% Offline & Reliable Data Persistence
- **Persistent Storage:** All data automatically persists in `localStorage` after every change.
- **Interruption Resilience:** Survives app closing, refreshing, switching tabs, or phone reboots.
- **Service Worker (`sw.js` v9):** Pre-caches `clubstride-tokens.css`, `tailwind.min.css`, `html2pdf.bundle.min.js`, the CI component scripts and all brand/icon assets for offline loading anywhere on the pitch.
- **Backup & Restore:** Full JSON export and import in settings.

---

*Site rebuild trigger – $(Get-Date -Format o)*

## 🏃 How to Run Locally

### Option A: Python HTTP Server (Recommended)
```bash
python -m http.server 8000
```
Open your browser at: `http://localhost:8000`

### Option B: Node.js `npx serve`
```bash
npx serve .
```

### Option C: Compile Tailwind CSS
To recompile `tailwind.min.css` from `src/input.css`:
```bash
node ./node_modules/tailwindcss/lib/cli.js -i ./src/input.css -o ./tailwind.min.css --minify
```
or
```bash
npm run build:css
```

### Option D: Self-Contained Bundle
To generate the 100% self-contained single-file HTML bundle:
```bash
python bundle_offline.py
```
This updates `Clubstride Lite.html`, which can be opened directly from disk in any web browser without a local server.

---

*Site rebuild trigger – $(Get-Date -Format o)*

## 🧪 Testing

Run the automated test suite covering all 20 specification requirements:
```bash
node test_app.js
```

---

*Site rebuild trigger – $(Get-Date -Format o)*

## 📱 Mobile Testing Checklist (390x844 Screen)

1. **Tactics Screen:**
   - [ ] Switch match formats (5v5, 7v7, 9v9, 11v11) and verify the formations dropdown updates.
   - [ ] Select `2-1-2-1` in 7v7, `3-1-3-1` in 9v9, `3-4-3` and `4-5-1` in 11v11. Verify player tokens animate smoothly to their positions.
   - [ ] Verify Goalkeeper (GK) is positioned in the goal area at the bottom ($y \approx 88\text{--}90\%$).
   - [ ] Verify pitch shows striped grass pattern with rounded corners.
2. **Live Match:**
   - [ ] Test `+` and `−` score adjustment steppers for both teams.
   - [ ] Register a goal: verify the popup requires picking a player before saving.
   - [ ] Undo a goal from the timeline and verify score and stats update immediately.
   - [ ] Tap **End match**: verify confirmation popup appears, finished match archives to history, and timers reset to 00:00 without losing squad or teams.
3. **PDF Reports:**
   - [ ] Tap **Create PDF Report** on the Stats screen: verify the bottom sheet opens with **Single Match** and **Date Range** tabs.
   - [ ] Generate a Single Match PDF: verify file name `Clubstride_<Team>_<Opponent>_<Date>.pdf` and check player table (pitch minutes, bench minutes, goals, assists, subs).
   - [ ] Generate a Date Range PDF: test quick presets (Last 7d, This Month, Season, All Time), verify overall record (W/D/L), match list, and player totals sorted by minutes played with highlights for top scorer, top assists, and most minutes.
4. **Offline & Nav:**
   - [ ] Turn on Airplane Mode: verify app reloads and operates completely offline from service worker cache (`Clubstride Lite-v9`).
   - [ ] Verify the bottom navigation dock is always tappable with comfortable padding.


