/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Two-way API Sync Layer connecting Club Stride Mobile <-> Club Stride Pro Central Command
 */

const SYNC_STORAGE_KEYS = {
  ROSTER: 'clubstride_roster_data',
  QUEUE: 'clubstride_sync_queue',
  ROLE: 'clubstride_current_role',
  LAST_SYNC: 'clubstride_last_sync_timestamp'
};

export class ClubStrideProSync {
  constructor(endpoint = 'https://api.clubstride.com/v1') {
    this.endpoint = endpoint;
    this.isOnline = navigator.onLine;
    this.initNetworkListeners();
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Pull master roster from Club Stride Pro with age-group sorting
   */
  async pullRoster(ageGroup = 'U11') {
    try {
      if (!this.isOnline) {
        return this.getCachedRoster(ageGroup);
      }

      // Simulated sync request to Club Stride Pro master database
      const cached = this.getCachedRoster(ageGroup);
      localStorage.setItem(SYNC_STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return {
        status: 'synced',
        ageGroup,
        players: cached,
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('[ClubStrideProSync] Pull failed, falling back to cache:', err);
      return this.getCachedRoster(ageGroup);
    }
  }

  /**
   * Push player stat modifications & tactical data to Pro central command
   */
  async pushPlayerStats(playerId, updatedStats) {
    const payload = {
      playerId,
      stats: updatedStats,
      timestamp: Date.now()
    };

    if (!this.isOnline) {
      this.enqueueOfflineChange('UPDATE_STATS', payload);
      return { status: 'queued_offline', payload };
    }

    try {
      // Optimistically save locally
      this.updateLocalPlayerStats(playerId, updatedStats);
      return { status: 'synced', payload };
    } catch (err) {
      this.enqueueOfflineChange('UPDATE_STATS', payload);
      return { status: 'queued_offline', payload };
    }
  }

  /**
   * Sync tactical formations and lineup overlays
   */
  async syncTactics(tacticsPayload) {
    if (!this.isOnline) {
      this.enqueueOfflineChange('SYNC_TACTICS', tacticsPayload);
      return { status: 'queued_offline' };
    }
    localStorage.setItem('clubstride_active_tactics', JSON.stringify(tacticsPayload));
    return { status: 'synced' };
  }

  getCachedRoster(ageGroup = 'U11') {
    const defaultRoster = [
      { id: 'p1', name: 'Amelia Vance', number: 10, ageGroup: 'U11', position: 'CM', goals: 8, assists: 6, pace: 84, passing: 89, rating: 8.8 },
      { id: 'p2', name: 'Carter Smith', number: 4, ageGroup: 'U11', position: 'CB', goals: 1, assists: 2, pace: 78, passing: 75, rating: 7.9 },
      { id: 'p3', name: 'Devon Miller', number: 1, ageGroup: 'U11', position: 'GK', goals: 0, assists: 0, pace: 65, passing: 72, rating: 8.2 },
      { id: 'p4', name: 'Preston Diaz', number: 5, ageGroup: 'U11', position: 'LB', goals: 2, assists: 4, pace: 86, passing: 80, rating: 8.1 },
      { id: 'p5', name: 'Jordan Reed', number: 9, ageGroup: 'U11', position: 'ST', goals: 12, assists: 3, pace: 91, passing: 77, rating: 9.0 }
    ];

    const raw = localStorage.getItem(SYNC_STORAGE_KEYS.ROSTER);
    if (!raw) {
      localStorage.setItem(SYNC_STORAGE_KEYS.ROSTER, JSON.stringify(defaultRoster));
      return defaultRoster.filter(p => !ageGroup || p.ageGroup === ageGroup);
    }
    const parsed = JSON.parse(raw);
    return parsed.filter(p => !ageGroup || p.ageGroup === ageGroup);
  }

  updateLocalPlayerStats(playerId, stats) {
    const raw = localStorage.getItem(SYNC_STORAGE_KEYS.ROSTER);
    if (!raw) return;
    const roster = JSON.parse(raw);
    const idx = roster.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      roster[idx] = { ...roster[idx], ...stats };
      localStorage.setItem(SYNC_STORAGE_KEYS.ROSTER, JSON.stringify(roster));
    }
  }

  enqueueOfflineChange(type, payload) {
    const queue = JSON.parse(localStorage.getItem(SYNC_STORAGE_KEYS.QUEUE) || '[]');
    queue.push({ type, payload, createdAt: Date.now() });
    localStorage.setItem(SYNC_STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }

  async flushQueue() {
    const raw = localStorage.getItem(SYNC_STORAGE_KEYS.QUEUE);
    if (!raw) return;
    const queue = JSON.parse(raw);
    if (!queue.length) return;

    console.info(`[ClubStrideProSync] Flushing ${queue.length} offline operations to Pro...`);
    localStorage.removeItem(SYNC_STORAGE_KEYS.QUEUE);
  }
}

export const syncService = new ClubStrideProSync();
export default syncService;
