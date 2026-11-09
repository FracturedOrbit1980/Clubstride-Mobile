/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Page: PlayerHub.js - Real-time stat visualization & player performance rings
 */

import { renderStatRing } from '../components/shared/StatRing.js';
import { renderFloatingCard } from '../components/shared/FloatingCard.js';

export function renderPlayerHub({
  player = {
    id: 'p1',
    name: 'Amelia Vance',
    number: 10,
    role: 'Central Midfielder (CM)',
    team: 'Clubstride U11 Echo Strikers',
    pace: 84,
    passing: 89,
    shooting: 78,
    defending: 74,
    physical: 82,
    attendance: 95,
    matches: 12,
    goals: 8,
    assists: 6,
    minutes: 480
  }
} = {}) {
  // Stat rings
  const paceRing = renderStatRing({ value: player.pace, label: 'Pace', colorGradient: 'primary', icon: '⚡' });
  const passingRing = renderStatRing({ value: player.passing, label: 'Passing', colorGradient: 'turf', icon: '🎯' });
  const shootingRing = renderStatRing({ value: player.shooting, label: 'Shooting', colorGradient: 'primary', icon: '⚽' });
  const defendingRing = renderStatRing({ value: player.defending, label: 'Defending', colorGradient: 'turf', icon: '🛡️' });
  const physicalRing = renderStatRing({ value: player.physical, label: 'Physical', colorGradient: 'primary', icon: '💪' });
  const attendanceRing = renderStatRing({ value: player.attendance, label: 'Attendance', colorGradient: 'turf', icon: '📅' });

  const heroCard = renderFloatingCard({
    variant: 'primary-glow',
    contentHtml: `
      <div class="flex items-center gap-4">
        <div class="relative">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl border border-white/30">
            #${player.number}
          </div>
          <span class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900" title="Active"></span>
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-black text-white">${player.name}</h2>
            <span class="glass-pill px-2 py-0.5 text-[10px] font-bold text-cyan-300">PRO RATED</span>
          </div>
          <p class="text-xs text-white/80 font-medium">${player.role}</p>
          <p class="text-[11px] text-white/60">${player.team}</p>
        </div>
      </div>

      <!-- Quick season numbers -->
      <div class="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
        <div>
          <span class="block text-base font-black text-white">${player.matches}</span>
          <span class="text-[9px] uppercase font-bold text-white/60">Matches</span>
        </div>
        <div>
          <span class="block text-base font-black text-emerald-400">${player.goals}</span>
          <span class="text-[9px] uppercase font-bold text-white/60">Goals</span>
        </div>
        <div>
          <span class="block text-base font-black text-cyan-400">${player.assists}</span>
          <span class="text-[9px] uppercase font-bold text-white/60">Assists</span>
        </div>
        <div>
          <span class="block text-base font-black text-purple-300">${player.minutes}'</span>
          <span class="text-[9px] uppercase font-bold text-white/60">Minutes</span>
        </div>
      </div>
    `
  });

  return `
    <div class="player-hub-page space-y-4 pb-24">
      <!-- Header -->
      <header class="flex items-center justify-between py-2">
        <div class="flex items-center gap-2">
          <a href="#dashboard" class="glass-pill w-8 h-8 flex items-center justify-center text-white" title="Back to Dashboard">
            ←
          </a>
          <div>
            <h1 class="text-xl font-black text-white tracking-tight">Player Hub</h1>
            <p class="text-xs text-white/60">Real-Time Stat Visualization</p>
          </div>
        </div>
        <button id="btn-export-pdf" class="glass-pill px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 hover:bg-white/20">
          <svg class="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Export
        </button>
      </header>

      <!-- Player Hero Card -->
      ${heroCard}

      <!-- Antigravity Stat Rings Section -->
      <div class="antigravity-card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-white">Performance Attributes</h3>
          <span class="text-[10px] text-white/60">Calibrated to U11 Benchmark</span>
        </div>
        
        <div class="grid grid-cols-3 gap-y-4 justify-items-center">
          ${paceRing}
          ${passingRing}
          ${shootingRing}
          ${defendingRing}
          ${physicalRing}
          ${attendanceRing}
        </div>
      </div>

      <!-- Recent Match Feed -->
      <div class="antigravity-card-dark p-5">
        <h3 class="text-xs font-bold uppercase tracking-wider text-white mb-3">Recent Match Log</h3>
        <div class="space-y-2">
          <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-white">vs Northern Warriors</p>
              <span class="text-[10px] text-white/50">W 4-2 • 40 mins • 2 Goals, 1 Assist</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-black bg-emerald-500/20 text-emerald-300">
              9.2
            </span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-white">vs Lakeside Rovers</p>
              <span class="text-[10px] text-white/50">D 1-1 • 45 mins • 1 Assist</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-black bg-cyan-500/20 text-cyan-300">
              8.5
            </span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export default renderPlayerHub;
