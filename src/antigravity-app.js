/**
 * Club Stride Mobile - Antigravity UI Architecture Controller
 * Mounts and coordinates the Antigravity PWA UI (Coach & Parent Dual-Role Views)
 */

import { renderDashboard } from './pages/Dashboard.js';
import { renderPlayerHub } from './pages/PlayerHub.js';
import { renderGlassNavBar } from './components/shared/GlassNavBar.js';
import { syncService } from './services/ClubStrideProSync.js';

export class AntigravityApp {
  constructor(mountSelector = '#antigravity-app-root') {
    this.mountEl = document.querySelector(mountSelector);
    this.currentRole = localStorage.getItem('cs_antigravity_role') || 'coach';
    this.activeTab = (window.location.hash.replace('#', '') || 'dashboard');
    this.init();
  }

  init() {
    if (!this.mountEl) {
      this.mountEl = document.createElement('div');
      this.mountEl.id = 'antigravity-app-root';
      this.mountEl.className = 'min-h-screen text-white p-4 max-w-md mx-auto relative';
      document.body.prepend(this.mountEl);
    }

    window.addEventListener('hashchange', () => {
      const route = window.location.hash.replace('#', '') || 'dashboard';
      if (['dashboard', 'player-hub', 'sync'].includes(route)) {
        this.activeTab = route;
        this.render();
      }
    });

    this.render();
  }

  setRole(role) {
    this.currentRole = role;
    localStorage.setItem('cs_antigravity_role', role);
    this.render();
  }

  render() {
    let pageHtml = '';
    if (this.activeTab === 'player-hub') {
      pageHtml = renderPlayerHub();
    } else {
      pageHtml = renderDashboard({ role: this.currentRole });
    }

    const navHtml = renderGlassNavBar({
      activeTab: this.activeTab,
      currentRole: this.currentRole
    });

    this.mountEl.innerHTML = `
      ${pageHtml}
      ${navHtml}
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Role switcher
    const roleToggle = this.mountEl.querySelector('#cs-role-toggle');
    if (roleToggle) {
      roleToggle.addEventListener('click', () => {
        this.setRole(this.currentRole === 'coach' ? 'parent' : 'coach');
      });
    }

    // Sync Pro button
    const syncBtn = this.mountEl.querySelector('#btn-sync-pro');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        syncBtn.innerHTML = `<span>Syncing with Pro...</span>`;
        await syncService.pullRoster();
        setTimeout(() => {
          this.render();
        }, 600);
      });
    }

    // Stat adjustments in Coach View
    this.mountEl.querySelectorAll('[data-stat-inc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const statKey = e.currentTarget.getAttribute('data-stat-inc');
        const valEl = this.mountEl.querySelector(`#stat-val-${statKey}`);
        if (valEl) {
          valEl.innerText = parseInt(valEl.innerText || 0) + 1;
        }
      });
    });

    this.mountEl.querySelectorAll('[data-stat-dec]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const statKey = e.currentTarget.getAttribute('data-stat-dec');
        const valEl = this.mountEl.querySelector(`#stat-val-${statKey}`);
        if (valEl && parseInt(valEl.innerText) > 0) {
          valEl.innerText = parseInt(valEl.innerText) - 1;
        }
      });
    });
  }
}

// Auto-bootstrap when page loads
if (typeof window !== 'undefined') {
  window.AntigravityApp = AntigravityApp;
}
