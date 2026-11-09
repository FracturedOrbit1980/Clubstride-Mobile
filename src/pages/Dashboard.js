/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Page: Dashboard.js - Role-based dynamic routing (Coach View vs. Parent View)
 * Integrates Pitch-Side UX/UI Architecture (Tier 1 Blueprint, Tier 2 Conductor, Tier 3 Spectator)
 */

import { renderFloatingCard } from '../components/shared/FloatingCard.js';
import { renderRosterSyncUI } from '../components/coach/RosterSyncUI.js';
import { renderMatchModeConductor } from '../components/coach/MatchModeConductor.js';
import { renderTacticalOverlay } from '../components/coach/TacticalOverlay.js';
import { renderStatEditor } from '../components/coach/StatEditor.js';
import { renderMatchModeSpectator } from '../components/parent/MatchModeSpectator.js';
import { renderCollectionPortal } from '../components/parent/CollectionPortal.js';
import { renderProfileBuilder } from '../components/parent/ProfileBuilder.js';
import { blueprintSync } from '../services/ClubBlueprintSync.js';

export function renderDashboard({ role = 'coach', isMatchDayMode = false } = {}) {
  const isCoach = role === 'coach';

  return `
    <div class="dashboard-page space-y-4 pb-28">
      <!-- Top Dynamic Header with Match Day Mode Toggle -->
      <header class="flex items-center justify-between py-2">
        <div>
          <h1 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Clubstride <span class="text-xs px-2 py-0.5 rounded-md font-bold ${isCoach ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}">${isCoach ? 'COACH' : 'PARENT'}</span>
          </h1>
          <p class="text-xs text-white/60">${isCoach ? 'Pitch-Side Conductor & Setup' : 'Spectator Compass & Live Pulse'}</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Touchline Match Day Mode Switch -->
          <button 
            id="toggle-matchday-mode" 
            onclick="window.toggleMatchDayMode && window.toggleMatchDayMode()"
            class="glass-pill px-2.5 py-1 text-[11px] font-black flex items-center gap-1.5 transition-all ${isMatchDayMode ? 'bg-yellow-400 text-black border-yellow-300' : 'text-yellow-300 border-yellow-400/30'}"
            title="Toggle High-Contrast Touchline Sunlight Mode"
          >
            <span>☀️</span>
            <span>${isMatchDayMode ? 'PITCH MODE ON' : 'MATCH DAY'}</span>
          </button>

          <div class="w-9 h-9 rounded-full overflow-hidden border border-white/20 p-0.5">
            <img src="./src/assets/${isCoach ? 'avatar-coach.svg' : 'avatar-parent.svg'}" alt="User Avatar" class="w-full h-full object-cover rounded-full"/>
          </div>
        </div>
      </header>

      ${isCoach ? renderCoachView(isMatchDayMode) : renderParentView(isMatchDayMode)}
    </div>
  `;
}

function renderCoachView(isMatchDayMode) {
  const activeFixture = blueprintSync.getActiveFixture();

  return `
    <section class="space-y-4">
      <!-- Tier 1: Blueprint Sync Banner ("Push to Match Day") -->
      <div class="antigravity-card p-4 border border-cyan-400/30">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="text-[10px] font-black uppercase text-cyan-300 tracking-wider">Tier 1: Club Blueprint</span>
            <h3 class="text-xs font-bold text-white">${activeFixture?.title || 'League Match 6'}</h3>
          </div>
          <button 
            id="btn-push-matchday" 
            onclick="window.handlePushToMatchDay && window.handlePushToMatchDay()"
            class="px-3 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-300 shadow-lg active:scale-95 transition-all"
          >
            Push to Match Day
          </button>
        </div>
        <p class="text-[11px] text-white/70">
          Syncs fixture, field allocation (${activeFixture?.fieldNumber}), and eligible roster directly to touchline view.
        </p>
      </div>

      <!-- Tier 2: Coach Conductor (In-Game 2D Pitch & Massive Sticky Action Bar) -->
      ${renderMatchModeConductor()}

      <!-- Standard Roster & Tactical Lineup Staging (Pre-Match) -->
      ${renderTacticalOverlay({ formation: '4-3-3' })}

      <!-- Quick Stat Modifier for Captain/Key Player -->
      ${renderStatEditor()}
    </section>
  `;
}

function renderParentView(isMatchDayMode) {
  return `
    <section class="space-y-4">
      <!-- Tier 3: The Parent (The Compass & The Live Pulse) -->
      ${renderMatchModeSpectator()}

      <!-- Fee Collection Portal -->
      ${renderCollectionPortal()}

      <!-- Standalone Profile Builder -->
      ${renderProfileBuilder()}
    </section>
  `;
}

export default renderDashboard;
