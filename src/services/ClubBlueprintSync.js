/**
 * Club Stride Mobile - Pitch-Side UX/UI Architecture
 * Tier 1: The Club (The Blueprint)
 * Manages fixtures, field allocation, rosters, and "Push to Match Day" broadcast
 */

const BLUEPRINT_STORAGE_KEYS = {
  ACTIVE_FIXTURE: 'clubstride_blueprint_fixture',
  PUSH_HISTORY: 'clubstride_push_history'
};

export class ClubBlueprintSync {
  constructor() {
    this.initDefaultFixture();
  }

  initDefaultFixture() {
    if (!localStorage.getItem(BLUEPRINT_STORAGE_KEYS.ACTIVE_FIXTURE)) {
      const defaultBlueprint = {
        fixtureId: 'fix-2026-11-09-01',
        title: 'League Match 6: Cup Qualifier',
        opponent: 'Echo Strikers',
        kickoffTime: '15:30 CAT',
        fieldNumber: 'Field 4 (South Pitch)',
        fieldMapPin: { lat: -26.195246, lng: 28.034088, label: 'Benoni Sports Complex Field 4' },
        kitColor: {
          primary: '#1E3A8A', // Deep Navy
          accent: '#3BE38A',  // Electric Turf
          name: 'Home Navy / Turf'
        },
        ageGroup: 'U11',
        format: '7v7',
        roster: [
          { id: 'p1', name: 'Devon Miller', number: 1, pos: 'GK', status: 'starting' },
          { id: 'p2', name: 'Carter Smith', number: 4, pos: 'CB', status: 'starting' },
          { id: 'p3', name: 'Preston Diaz', number: 5, pos: 'CB', status: 'starting' },
          { id: 'p4', name: 'Amelia Vance', number: 10, pos: 'CM', status: 'starting' },
          { id: 'p5', name: 'Jordan Reed', number: 9, pos: 'ST', status: 'starting' },
          { id: 'p6', name: 'Leo Harris', number: 7, pos: 'RW', status: 'starting' },
          { id: 'p7', name: 'Noah Green', number: 11, pos: 'LW', status: 'starting' },
          { id: 'p8', name: 'Lucas Scott', number: 12, pos: 'SUB', status: 'bench' },
          { id: 'p9', name: 'Ethan Clark', number: 14, pos: 'SUB', status: 'bench' }
        ],
        pushedAt: new Date().toISOString()
      };
      localStorage.setItem(BLUEPRINT_STORAGE_KEYS.ACTIVE_FIXTURE, JSON.stringify(defaultBlueprint));
    }
  }

  getActiveFixture() {
    try {
      const raw = localStorage.getItem(BLUEPRINT_STORAGE_KEYS.ACTIVE_FIXTURE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * "Push to Match Day"
   * Single action button firing fixture directly into Coach view & Parent Compass
   */
  async pushToMatchDay(fixtureUpdates = {}) {
    const current = this.getActiveFixture() || {};
    const updated = {
      ...current,
      ...fixtureUpdates,
      pushedAt: new Date().toISOString()
    };
    localStorage.setItem(BLUEPRINT_STORAGE_KEYS.ACTIVE_FIXTURE, JSON.stringify(updated));

    // Dispatch system-wide broadcast event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('clubstride:push_to_matchday', {
        detail: updated
      }));
    }

    return {
      success: true,
      timestamp: Date.now(),
      payload: updated
    };
  }
}

export const blueprintSync = new ClubBlueprintSync();
export default blueprintSync;
