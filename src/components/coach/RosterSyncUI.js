/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Coach View: RosterSyncUI Component - Two-way Sync with Club Stride Pro Central Command
 */

export function renderRosterSyncUI({
  syncStatus = 'synced', // 'synced', 'syncing', 'pending', 'offline'
  lastSyncTime = 'Just now',
  totalPlayers = 18,
  activeAgeGroup = 'U11',
  unpushedChanges = 0
} = {}) {
  const statusColors = {
    synced: 'bg-emerald-400 text-emerald-950 border-emerald-300',
    syncing: 'bg-cyan-400 text-cyan-950 border-cyan-300 animate-spin',
    pending: 'bg-amber-400 text-amber-950 border-amber-300',
    offline: 'bg-rose-400 text-rose-950 border-rose-300'
  };

  return `
    <div class="antigravity-card-dark p-5 mb-4">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl ethereal-glow-primary flex items-center justify-center text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <div>
            <h4 class="text-sm font-bold text-white">Club Stride Pro Sync</h4>
            <p class="text-xs text-white/60">Central Command Database</p>
          </div>
        </div>
        <span class="px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[syncStatus] || statusColors.synced}">
          ${syncStatus.toUpperCase()}
        </span>
      </div>

      <!-- Sync Meta Stats -->
      <div class="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-white/5 border border-white/10 mb-4 text-center">
        <div>
          <span class="block text-base font-black text-white">${totalPlayers}</span>
          <span class="text-[10px] text-white/60 uppercase">Roster</span>
        </div>
        <div>
          <span class="block text-base font-black text-cyan-400">${activeAgeGroup}</span>
          <span class="text-[10px] text-white/60 uppercase">Group</span>
        </div>
        <div>
          <span class="block text-base font-black ${unpushedChanges > 0 ? 'text-amber-400' : 'text-emerald-400'}">${unpushedChanges}</span>
          <span class="text-[10px] text-white/60 uppercase">Unsaved</span>
        </div>
      </div>

      <!-- Sync Actions -->
      <div class="flex gap-2">
        <button id="btn-sync-pro" class="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white ethereal-glow-primary flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Sync Roster Now
        </button>
        <button id="btn-view-cloud-roster" class="py-2.5 px-3 rounded-xl text-xs font-bold text-white/80 glass-pill hover:text-white transition-all">
          Details
        </button>
      </div>
      <p class="text-[10px] text-center text-white/50 mt-2">Last synced: ${lastSyncTime}</p>
    </div>
  `;
}

export default renderRosterSyncUI;
