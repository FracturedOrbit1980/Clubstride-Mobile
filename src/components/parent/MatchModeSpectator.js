/**
 * Club Stride Mobile - Pitch-Side UX/UI Architecture
 * Tier 3: The Parent (The Spectator)
 * Pre-Match Hero Compass & In-Game Live Match Pulse with Sideline Contributions
 */

export function renderMatchModeSpectator({
  fixture = {
    title: 'Cup Qualifier vs Echo Strikers',
    kickoffTime: '15:30 CAT',
    fieldNumber: 'Field 4 (South Pitch)',
    mapPinUrl: 'https://maps.google.com/?q=-26.195246,28.034088',
    kitColor: 'Home Navy / Turf Glow',
    childName: 'Amelia Vance',
    jerseyNumber: 10
  },
  events = [
    { id: 'ev1', min: '14\'', type: 'GOAL', text: 'GOAL! Amelia Vance (#10) strikes top right corner!', score: '1 - 0' },
    { id: 'ev2', min: '22\'', type: 'CARD', text: 'Yellow Card - Opposition #4', score: '1 - 0' },
    { id: 'ev3', min: '31\'', type: 'GOAL', text: 'GOAL! Jordan Reed (#9) assisted by Amelia Vance', score: '2 - 1' }
  ],
  moments = [
    { id: 'm1', time: '14:45', author: 'Parent (Sarah)', caption: 'Warmup drills on Field 4', isPhoto: true }
  ]
} = {}) {
  const eventRows = events.map(ev => `
    <div class="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 transition-all hover:bg-white/10 ${ev.type === 'GOAL' ? 'border-emerald-400/40 bg-emerald-500/10' : ''}">
      <div class="px-2 py-1 rounded-xl text-xs font-black ${ev.type === 'GOAL' ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'}">
        ${ev.min}
      </div>
      <div class="flex-1">
        <p class="text-xs font-bold text-white">${ev.text}</p>
        <span class="text-[10px] text-white/60 font-semibold">Match Score: ${ev.score}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="space-y-4">
      <!-- Pre-Match (The Compass) Hero Card -->
      <div class="antigravity-card p-4 relative overflow-hidden border-2 border-cyan-400/30">
        <div class="flex items-center justify-between mb-3">
          <span class="glass-pill px-3 py-1 text-xs font-black text-cyan-300">
            NEXT MATCH COMPASS
          </span>
          <span class="text-xs text-white/70 font-semibold">Kickoff: ${fixture.kickoffTime}</span>
        </div>

        <h3 class="text-base font-black text-white mb-1">${fixture.title}</h3>
        <p class="text-xs text-cyan-300 font-bold mb-3">Player: ${fixture.childName} (#${fixture.jerseyNumber})</p>

        <!-- Vital Pitch-Side Metadata Grid -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <!-- Field Number & Map Pin -->
          <a href="${fixture.mapPinUrl}" target="_blank" rel="noopener" class="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2.5 hover:bg-white/20 transition-all">
            <span class="text-lg">📍</span>
            <div>
              <span class="block text-[10px] uppercase font-bold text-white/60">Field Location</span>
              <span class="font-bold text-white underline">${fixture.fieldNumber}</span>
            </div>
          </a>

          <!-- Kit Color Indicator -->
          <div class="p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2.5">
            <div class="w-6 h-6 rounded-full bg-blue-900 border-2 border-emerald-400 flex items-center justify-center text-[10px]">
              👕
            </div>
            <div>
              <span class="block text-[10px] uppercase font-bold text-white/60">Kit Colors</span>
              <span class="font-bold text-white">${fixture.kitColor}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- In-Game (The Pulse): Live Match Ticker -->
      <div class="antigravity-card-dark p-4 border border-white/20" id="spectator-pulse-box">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h4 class="text-xs font-black uppercase text-white tracking-wider">Live Match Pulse</h4>
          </div>
          <span class="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">LIVE TICKER</span>
        </div>

        <!-- Live Events -->
        <div class="space-y-2 mb-4" id="spectator-timeline">
          ${eventRows}
        </div>

        <!-- Sideline Contribution (Match Moments Camera Button) -->
        <div class="pt-3 border-t border-white/10">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-xs font-bold text-white">Sideline Moments</h5>
              <p class="text-[10px] text-white/60">Contribute tagged matchday photos</p>
            </div>
            <label class="glass-pill px-3 py-2 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer hover:bg-white/20 active:scale-95 transition-all">
              <span>📷 Snap Photo</span>
              <input type="file" accept="image/*" capture="environment" class="hidden" id="input-sideline-camera" onchange="window.handleSidelinePhoto && window.handleSidelinePhoto(event)"/>
            </label>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default renderMatchModeSpectator;
