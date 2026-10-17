# GameOn — Tactical Pitch & Live Rotations PWA

**GameOn** is an offline-first Progressive Web App (PWA) designed specifically for grassroots soccer coaches. It runs completely locally in the browser on desktop, tablet, or mobile phone, requiring zero backend server, zero login, and no internet connection during match day.

---

## 🚀 Key Features

### 1. 📋 Tactical Pitch & Lineup Builder
- **Multi-Format Support:** Preset formations for **5v5**, **7v7**, **9v9**, and **11v11**.
- **Interactive Pitch:** Drag-and-drop player tokens to customize player roles and spatial positioning.
- **Kit Customization:** Custom color picker and palette swatches with automatic high-contrast shirt numbering.
- **Day/Night Turf Modes:** Switch between Day turf (high contrast) and Night turf (cyber glow).
- **Pitch Styles:** Glass, Neon, Stadium, and Retro styling.

### 2. ⏱️ Live Match Console & Rotations Engine
- **Digital Stopwatch:** Play/pause, reset, and half management (1st Half / 2nd Half).
- **One-Tap Tactical Sub Board:** Tap a player on the field to sub out, then tap a bench reserve to swap in.
- **Live Playing Timers:** Automatically accumulates playing minutes for active field players while pausing bench players.
- **Scoreboard with Touch Steppers:** Independent `+` and `−` score adjustment buttons for both your team and opponents.
- **Goal & Assist Logger:** Fast modal recording goals and assists; requires selecting the achieving squad member before saving.
- **Timeline & Instant Undo:** Event log showing goals, assists, and substitutions with one-tap `✕ Undo` to revert mistaken goals and update player statistics.
- **🏁 End Match Workflow:** Safely archive the completed match (date, score, player minutes, goals, assists, substitutions, timeline) into **Match History** and reset stopwatch, score, and live timers ready for the next game.

### 3. 👥 Squad Registry
- Add and edit squad members (full name, jersey number 1–99, tactical position).
- Mark pre-game availability (Available vs Out).
- Assign starter or bench status.

### 4. 📊 Performance Analytics & Match History
- Cumulative player minutes, goals, and assists aggregated across all matches.
- Detailed **Match History** section displaying every completed game with final scores, duration, and date.
- One-tap **PDF Report** generation for any past match or live session.

### 5. 📄 Official Match Ledger (PDF Export)
- Generate branded, print-ready PDF match intelligence reports directly on device via `html2pdf`.
- Includes match fixture metadata, final score, complete player minutes/goals/assists table, and chronological event timeline.

### 6. 💾 100% Offline & Reliable Data Persistence
- **Persistent Storage:** All squad data, teams, match configurations, live timer state, and match history automatically persist in `localStorage`.
- **Interruption Resilience:** Survives app closing, refreshing, switching tabs, or phone reboots.
- **Service Worker (`sw.js` v3):** Pre-caches all essential static assets for fast, offline loading anywhere on the pitch.

### 7. 📤 Data Backup & Device Transfer
- **Export Backup:** Download a full JSON file containing all teams, rosters, live states, and match histories.
- **Import Backup:** Restore data on a new phone or tablet with one click.

---

## 🏃 How to Run Locally

You can run GameOn using any static web server:

### Option A: Python HTTP Server (Recommended)
```bash
python -m http.server 8000
```
Open your browser and navigate to:
```
http://localhost:8000
```

### Option B: Node.js `npx serve`
```bash
npx serve .
```

### Option C: Self-Contained Bundle
To generate the 100% self-contained single-file HTML bundle:
```bash
python bundle_offline.py
```
This updates `gameon.html`, which can be opened directly from disk in any web browser without a local server.

---

## 🌐 How to Deploy to GitHub Pages

1. Commit and push your changes to your GitHub repository:
   ```bash
   git add -A
   git commit -m "Update GameOn features"
   git push origin main
   ```
2. In your repository on GitHub:
   - Navigate to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select the `main` branch and `/ (root)` folder, then click **Save**.
3. Your PWA will be published at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

---

## 📱 How to Install on a Phone

### On iOS (iPhone / iPad)
1. Open the deployed link in **Safari**.
2. Tap the **Share** button (box with an upward arrow `[↑]`).
3. Scroll down and tap **Add to Home Screen**.
4. The GameOn icon will appear on your home screen and open full-screen like a native app.

### On Android
1. Open the deployed link in **Google Chrome**.
2. Tap the three-dot menu (**⋮**) in the top right corner.
3. Tap **Install app** or **Add to Home screen**.
4. Launch GameOn from your home screen with offline caching enabled.

---

## 🧪 Testing

Run the automated test suite to verify all core features:
```bash
node test_app.js
```
