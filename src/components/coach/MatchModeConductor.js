/**
 * Club Stride Mobile - Pitch-Side UX/UI Architecture
 * Tier 2: The Coach (The Conductor)
 * Pitch-Side Match Mode: Screen WakeLock, 2D Pitch Canvas, Double-Tap Goal, Swipe Sub, Fat-Action Buttons
 */

export function renderMatchModeConductor({
  matchState = {
    teamScore: 2,
    opponentScore: 1,
    opponent: 'Echo Strikers',
    clock: '34:12',
    isWakeLocked: true,
    playersOnPitch: [
      { id: 'p1', num: 1, name: 'Devon', pos: 'GK', x: 12, y: 50 },
      { id: 'p2', num: 4, name: 'Carter', pos: 'CB', x: 30, y: 32 },
      { id: 'p3', num: 5, name: 'Preston', pos: 'CB', x: 30, y: 68 },
      { id: 'p4', num: 10, name: 'Amelia', pos: 'CM', x: 55, y: 50 },
      { id: 'p5', num: 9, name: 'Jordan', pos: 'ST', x: 82, y: 50 }
    ],
    bench: [
      { id: 'p8', num: 12, name: 'Lucas', pos: 'SUB' },
      { id: 'p9', num: 14, name: 'Ethan', pos: 'SUB' }
    ]
  }
} = {}) {
  const playerNodes = matchState.playersOnPitch.map(p => `
    <div 
      class="pitch-player-token absolute -translate-x-1/2 -translate-y-1/2 select-none touch-manipulation cursor-pointer group"
      style="left: ${p.x}%; top: ${p.y}%;"
      data-player-id="${p.id}"
      data-player-num="${p.num}"
      data-player-name="${p.name}"
      title="Double-tap for Goal • Swipe down to Sub"
    >
      <div class="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-white shadow-2xl transition-transform active:scale-90 group-hover:scale-110">
        ${p.num}
      </div>
      <span class="block text-center text-[11px] font-black text-white mt-1 drop-shadow-md bg-black/60 px-1 rounded">
        ${p.name}
      </span>
    </div>
  `).join('');

  const benchPills = matchState.bench.map(b => `
    <button 
      class="bench-sub-pill px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs font-bold text-white flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-all"
      data-bench-id="${b.id}"
      data-bench-name="${b.name}"
    >
      <span class="w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">#${b.num}</span>
      <span>${b.name} (${b.pos})</span>
    </button>
  `).join('');

  return `
    <div id="conductor-pitch-container" class="space-y-3">
      <!-- Pitch-Side Match Status & Wake Lock Banner -->
      <div class="antigravity-card-dark p-3 flex items-center justify-between border-2 border-cyan-400/30">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
          <div>
            <h2 class="text-sm font-black text-white uppercase tracking-wider">LIVE MATCH CONDUCTOR</h2>
            <p class="text-[11px] text-cyan-300 font-semibold">vs ${matchState.opponent} • ${matchState.clock}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="glass-pill px-2.5 py-1 text-[11px] font-bold text-emerald-300 flex items-center gap-1" title="Screen WakeLock Active">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/></svg>
            SCREEN AWAKE
          </span>
          <div class="text-lg font-black text-white bg-black/60 px-3 py-1 rounded-xl border border-white/20">
            ${matchState.teamScore} - ${matchState.opponentScore}
          </div>
        </div>
      </div>

      <!-- 2D Touchline Pitch Canvas (Zero clutter, Roster hidden, Gestures active) -->
      <div class="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border-2 border-white/25 bg-slate-950/90 shadow-2xl p-3" id="conductor-canvas">
        <div class="absolute inset-3 border-2 border-white/20 rounded-2xl pointer-events-none"></div>
        <div class="absolute top-3 bottom-3 left-1/2 border-l-2 border-white/20 pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-white/20 pointer-events-none"></div>
        
        <!-- Field Tokens -->
        <div id="conductor-field-tokens" class="absolute inset-0">
          ${playerNodes}
        </div>

        <!-- Touch Hint Floating Pill -->
        <div class="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white/80 pointer-events-none">
          Double-Tap Avatar: GOAL • Swipe Down: SUB
        </div>
      </div>

      <!-- Bench Drawer (Slide-Up on Sub Gesture) -->
      <div id="bench-drawer" class="antigravity-card-dark p-3.5 border border-cyan-400/40 hidden">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-black uppercase text-cyan-300">Bench Drawer (Quick Sub)</h4>
          <button id="btn-close-bench" class="text-xs text-white/60 hover:text-white font-bold">✕ Close</button>
        </div>
        <div class="flex flex-wrap gap-2">
          ${benchPills}
        </div>
      </div>

      <!-- Massive Sticky Pitch-Side Action Bar (Fat-Finger Targets) -->
      <div class="matchday-action-bar">
        <button id="btn-fat-goal" class="btn-fat-action btn-fat-goal">
          <span class="text-lg leading-none">⚽</span>
          <span class="text-xs mt-1 font-black">GOAL</span>
        </button>
        <button id="btn-fat-foul" class="btn-fat-action btn-fat-foul">
          <span class="text-lg leading-none">🟨</span>
          <span class="text-xs mt-1 font-black">FOUL / CARD</span>
        </button>
        <button id="btn-fat-sub" class="btn-fat-action btn-fat-sub">
          <span class="text-lg leading-none">⇄</span>
          <span class="text-xs mt-1 font-black">SUB BENCH</span>
        </button>
      </div>
    </div>
  `;
}

export function bindConductorInteractions(containerEl, onEventLogged = null) {
  if (!containerEl) return;

  // Request screen wake lock
  if ('wakeLock' in navigator) {
    try {
      navigator.wakeLock.request('screen').catch(console.warn);
    } catch (e) {
      // safe fallback
    }
  }

  // Double-tap on player token -> Goal
  let lastTap = 0;
  containerEl.querySelectorAll('.pitch-player-token').forEach(token => {
    token.addEventListener('pointerdown', (e) => {
      const now = Date.now();
      const playerName = token.getAttribute('data-player-name');
      const playerNum = token.getAttribute('data-player-num');

      if (now - lastTap < 320) {
        // Trigger haptic
        if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
        // Trigger optimistic goal
        token.classList.add('pulse-goal-reaction');
        setTimeout(() => token.classList.remove('pulse-goal-reaction'), 900);

        if (onEventLogged) {
          onEventLogged({ type: 'GOAL', player: { name: playerName, number: playerNum } });
        }
      }
      lastTap = now;
    });
  });

  // Fat action buttons
  const goalBtn = containerEl.querySelector('#btn-fat-goal');
  const foulBtn = containerEl.querySelector('#btn-fat-foul');
  const subBtn = containerEl.querySelector('#btn-fat-sub');
  const benchDrawer = containerEl.querySelector('#bench-drawer');
  const closeBench = containerEl.querySelector('#btn-close-bench');

  if (goalBtn) {
    goalBtn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([60, 40, 120]);
      if (onEventLogged) onEventLogged({ type: 'GOAL', player: { name: 'Field Play', number: 10 } });
    });
  }

  if (foulBtn) {
    foulBtn.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
      if (onEventLogged) onEventLogged({ type: 'CARD_YELLOW', player: { name: 'Opposition', number: 7 } });
    });
  }

  if (subBtn && benchDrawer) {
    subBtn.addEventListener('click', () => {
      benchDrawer.classList.toggle('hidden');
    });
  }

  if (closeBench && benchDrawer) {
    closeBench.addEventListener('click', () => {
      benchDrawer.classList.add('hidden');
    });
  }
}

export default renderMatchModeConductor;
