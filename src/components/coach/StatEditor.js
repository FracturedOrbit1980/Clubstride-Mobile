/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Coach View: StatEditor Component - Real-time stat modifier & tactical evaluation
 */

export function renderStatEditor({
  player = { id: 'p1', name: 'Amelia Vance', number: 10, goals: 2, assists: 3, minutes: 45, rating: 8.8 }
} = {}) {
  return `
    <div class="antigravity-card p-5 mb-4">
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center font-black text-cyan-300">
            #${player.number}
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">${player.name}</h4>
            <span class="text-xs text-white/70">Match Stat Modifier</span>
          </div>
        </div>
        <div class="glass-pill px-2.5 py-1 text-xs font-bold text-emerald-300">
          Rating: ${player.rating}
        </div>
      </div>

      <!-- Stat Adjuster Controls -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <!-- Goals Counter -->
        <div class="p-3 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center">
          <span class="text-[11px] text-white/70 font-semibold mb-1">Goals</span>
          <div class="flex items-center gap-2">
            <button class="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-95" data-stat-dec="goals">-</button>
            <span class="text-lg font-black text-white" id="stat-val-goals">${player.goals}</span>
            <button class="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-95" data-stat-inc="goals">+</button>
          </div>
        </div>

        <!-- Assists Counter -->
        <div class="p-3 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center">
          <span class="text-[11px] text-white/70 font-semibold mb-1">Assists</span>
          <div class="flex items-center gap-2">
            <button class="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-95" data-stat-dec="assists">-</button>
            <span class="text-lg font-black text-white" id="stat-val-assists">${player.assists}</span>
            <button class="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-95" data-stat-inc="assists">+</button>
          </div>
        </div>

        <!-- Minutes -->
        <div class="p-3 rounded-2xl bg-white/10 border border-white/15 flex flex-col items-center">
          <span class="text-[11px] text-white/70 font-semibold mb-1">Minutes</span>
          <div class="flex items-center gap-2">
            <button class="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-95" data-stat-dec="minutes">-</button>
            <span class="text-lg font-black text-white" id="stat-val-minutes">${player.minutes}</span>
            <button class="w-7 h-7 rounded-lg glass-pill flex items-center justify-center text-white font-bold hover:bg-white/20 active:scale-95" data-stat-inc="minutes">+</button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2">
        <button class="flex-1 py-2 rounded-xl text-xs font-bold text-white ethereal-glow-turf active:scale-95 transition-all" id="btn-save-stats">
          Save Stats to Cloud
        </button>
      </div>
    </div>
  `;
}

export default renderStatEditor;
