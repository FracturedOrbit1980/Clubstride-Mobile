/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Coach View: TacticalOverlay Component - Interactive tactical pitch overlay & formations
 */

export function renderTacticalOverlay({
  formation = '4-3-3',
  players = [
    { id: '1', number: 1, pos: 'GK', x: 8, y: 50, name: 'Devon' },
    { id: '2', number: 4, pos: 'CB', x: 25, y: 35, name: 'Carter' },
    { id: '3', number: 5, pos: 'CB', x: 25, y: 65, name: 'Preston' },
    { id: '4', number: 8, pos: 'CM', x: 50, y: 50, name: 'Amelia' },
    { id: '5', number: 9, pos: 'ST', x: 80, y: 50, name: 'Jordan' }
  ]
} = {}) {
  const playerNodes = players.map(p => `
    <div 
      class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
      style="left: ${p.x}%; top: ${p.y}%;"
      data-player-id="${p.id}"
      title="${p.name} (#${p.number})"
    >
      <div class="w-8 h-8 rounded-full bg-cyan-500/90 border-2 border-white text-white font-black text-xs flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-125">
        ${p.number}
      </div>
      <span class="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-white whitespace-nowrap opacity-90 group-hover:opacity-100">
        ${p.name}
      </span>
    </div>
  `).join('');

  return `
    <div class="tactical-glass-overlay p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h4 class="text-xs font-bold uppercase tracking-wider text-white">Tactical Pitch Overlay</h4>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-white/60">Formation:</span>
          <select id="formation-select" class="glass-pill px-2.5 py-1 text-xs font-bold text-white bg-slate-800/60 border border-white/20 outline-none">
            <option value="4-3-3" ${formation === '4-3-3' ? 'selected' : ''}>4-3-3 Attack</option>
            <option value="4-4-2" ${formation === '4-4-2' ? 'selected' : ''}>4-4-2 Balanced</option>
            <option value="3-5-2" ${formation === '3-5-2' ? 'selected' : ''}>3-5-2 Fluid</option>
          </select>
        </div>
      </div>

      <!-- Pitch Container -->
      <div class="relative w-full aspect-[3/2] rounded-2xl overflow-hidden border border-white/15 bg-slate-900/80 shadow-inner">
        <img 
          src="./src/assets/tactical-pitch-glass.svg" 
          alt="Tactical Pitch" 
          class="w-full h-full object-cover opacity-70 pointer-events-none"
        />
        <!-- Dynamic Player Nodes -->
        <div class="absolute inset-0">
          ${playerNodes}
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between text-[11px] text-white/70">
        <span>Tap any token to adjust positioning or bench swap</span>
        <button id="btn-reset-tactics" class="text-cyan-400 hover:underline">Reset Layout</button>
      </div>
    </div>
  `;
}

export default renderTacticalOverlay;
