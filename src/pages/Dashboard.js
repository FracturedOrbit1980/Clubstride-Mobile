/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Page: Dashboard.js - Role-based dynamic routing (Coach View vs. Parent View)
 */

import { renderFloatingCard } from '../components/shared/FloatingCard.js';
import { renderRosterSyncUI } from '../components/coach/RosterSyncUI.js';
import { renderTacticalOverlay } from '../components/coach/TacticalOverlay.js';
import { renderStatEditor } from '../components/coach/StatEditor.js';
import { renderCollectionPortal } from '../components/parent/CollectionPortal.js';
import { renderProfileBuilder } from '../components/parent/ProfileBuilder.js';

export function renderDashboard({ role = 'coach' } = {}) {
  const isCoach = role === 'coach';

  return `
    <div class="dashboard-page space-y-4 pb-24">
      <!-- Top Dynamic Header -->
      <header class="flex items-center justify-between py-2">
        <div>
          <h1 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Clubstride <span class="text-xs px-2 py-0.5 rounded-md font-bold ${isCoach ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}">${isCoach ? 'COACH' : 'PARENT'}</span>
          </h1>
          <p class="text-xs text-white/60">${isCoach ? 'Matchday & Pro Sync Hub' : 'Member & Player Portal'}</p>
        </div>
        <div class="w-9 h-9 rounded-full overflow-hidden border border-white/20 p-0.5">
          <img src="./src/assets/${isCoach ? 'avatar-coach.svg' : 'avatar-parent.svg'}" alt="User Avatar" class="w-full h-full object-cover rounded-full"/>
        </div>
      </header>

      ${isCoach ? renderCoachView() : renderParentView()}
    </div>
  `;
}

function renderCoachView() {
  const quickMetricsCard = renderFloatingCard({
    title: 'Matchday Squad Status',
    subtitle: 'Under-11 Division A • Match 6',
    badge: 'LIVE READY',
    variant: 'default',
    contentHtml: `
      <div class="grid grid-cols-3 gap-2 text-center my-2">
        <div class="p-2 rounded-xl bg-white/10">
          <span class="block text-lg font-black text-white">14</span>
          <span class="text-[10px] text-white/70">Attending</span>
        </div>
        <div class="p-2 rounded-xl bg-white/10">
          <span class="block text-lg font-black text-cyan-300">4-3-3</span>
          <span class="text-[10px] text-white/70">Shape</span>
        </div>
        <div class="p-2 rounded-xl bg-white/10">
          <span class="block text-lg font-black text-emerald-300">94%</span>
          <span class="text-[10px] text-white/70">Readiness</span>
        </div>
      </div>
    `,
    actionsHtml: `
      <button class="flex-1 py-2 rounded-xl text-xs font-bold text-white ethereal-glow-primary active:scale-95 transition-all">
        Launch Live Match
      </button>
    `
  });

  return `
    <section class="space-y-4">
      <!-- Club Stride Pro 2-Way Sync Banner -->
      ${renderRosterSyncUI({ syncStatus: 'synced', totalPlayers: 16, activeAgeGroup: 'U11', unpushedChanges: 0 })}

      <!-- Floating Squad Status -->
      ${quickMetricsCard}

      <!-- Interactive Tactical Pitch Overlay -->
      ${renderTacticalOverlay({ formation: '4-3-3' })}

      <!-- Quick Stat Modifier for Captain/Key Player -->
      ${renderStatEditor()}
    </section>
  `;
}

function renderParentView() {
  const parentWelcomeCard = renderFloatingCard({
    title: 'Amelia Vance (#10)',
    subtitle: 'U11 Strikers • Active Member',
    badge: 'STANDALONE',
    variant: 'dark',
    contentHtml: `
      <div class="flex items-center gap-3 my-2">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-lg">
          #10
        </div>
        <div class="flex-1">
          <div class="flex justify-between text-xs font-bold text-white mb-1">
            <span>Season Form</span>
            <span class="text-emerald-400">92%</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full bg-emerald-400 rounded-full" style="width: 92%"></div>
          </div>
        </div>
      </div>
    `,
    actionsHtml: `
      <a href="#player-hub" class="flex-1 py-2 text-center rounded-xl text-xs font-bold text-white ethereal-glow-primary active:scale-95 transition-all">
        View Full Stat Hub
      </a>
    `
  });

  return `
    <section class="space-y-4">
      <!-- Player Card Header -->
      ${parentWelcomeCard}

      <!-- Fee Collection Portal -->
      ${renderCollectionPortal()}

      <!-- Standalone Profile Builder -->
      ${renderProfileBuilder()}
    </section>
  `;
}

export default renderDashboard;
