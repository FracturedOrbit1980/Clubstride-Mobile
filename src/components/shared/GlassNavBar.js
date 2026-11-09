/**
 * Club Stride Mobile - Antigravity UI Architecture
 * GlassNavBar Component - Floating glassmorphic navigation bar with role switching
 */

export function renderGlassNavBar({ activeTab = 'dashboard', currentRole = 'coach', onRoleSwitch = null } = {}) {
  const isCoach = currentRole === 'coach';

  return `
    <nav class="fixed bottom-4 left-4 right-4 max-w-md mx-auto glass-navbar z-50 px-4 py-3 flex items-center justify-between">
      <!-- Role Switcher Pill -->
      <button 
        id="cs-role-toggle" 
        class="glass-pill px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-white transition-all duration-300 ${isCoach ? 'border-cyan-400/50 bg-cyan-500/20' : 'border-amber-400/50 bg-amber-500/20'}"
        title="Switch between Coach View and Parent View"
      >
        <span class="w-2 h-2 rounded-full ${isCoach ? 'bg-cyan-400 animate-pulse' : 'bg-amber-400 animate-pulse'}"></span>
        <span id="cs-role-label">${isCoach ? 'Coach View' : 'Parent View'}</span>
      </button>

      <!-- Navigation Links -->
      <div class="flex items-center gap-1 sm:gap-2">
        <a href="#dashboard" data-tab="dashboard" class="nav-item px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-white/20 text-white shadow-lg' : 'text-white/60 hover:text-white'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          <span>Home</span>
        </a>

        <a href="#player-hub" data-tab="player-hub" class="nav-item px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all duration-200 ${activeTab === 'player-hub' ? 'bg-white/20 text-white shadow-lg' : 'text-white/60 hover:text-white'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span>Players</span>
        </a>

        <a href="#sync" data-tab="sync" class="nav-item px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all duration-200 ${activeTab === 'sync' ? 'bg-white/20 text-white shadow-lg' : 'text-white/60 hover:text-white'}">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Sync Pro</span>
        </a>
      </div>
    </nav>
  `;
}

export default renderGlassNavBar;
