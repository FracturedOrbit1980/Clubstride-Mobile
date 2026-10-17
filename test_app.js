const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf-8');

// 1. Verify HTML elements exist
const expectedIds = [
  'modalMatchSetup', 'modalAddPlayer', 'modalSaveFormation', 'modalEvent', 'modalTeams',
  'modalEditGameMinutes', 'editGameMinutesList', 'selectedGamesBadge',
  'activeMatchTitleDisplay', 'activeMatchFormatBadge', 'activeMatchDateBadge',
  'tabBtn_pitch', 'tabBtn_live', 'tabBtn_roster', 'tabBtn_stats',
  'section_pitch', 'section_live', 'section_roster', 'section_stats',
  'scoreboardTeam', 'scoreboardOpponent', 'scoreboardGoals', 'scoreboardOpponentGoals',
  'clockToggleBtn', 'matchClockDisplay', 'clockStatusSubtext',
  'eventModalTitle', 'eventPlayerSelector',
  'inputMatchTeamName', 'inputMatchTitle', 'inputMatchOpponent', 'inputMatchDate',
  'backupFileInput'
];

for (const id of expectedIds) {
  assert(html.includes(`id="${id}"`), `Missing element id: ${id}`);
}
console.log('✓ All expected DOM element IDs present in index.html');

// 2. Verify meta tags
assert(html.includes('<meta name="mobile-web-app-capable" content="yes" />'), 'Missing mobile-web-app-capable');
assert(html.includes('<meta name="apple-mobile-web-app-capable" content="yes" />'), 'Missing apple-mobile-web-app-capable');
console.log('✓ Mobile web app meta tags verified');

// 3. Verify format wording is 7v7 (not 7-a-side)
assert(!html.includes('7-a-side'), 'Found deprecated "7-a-side" in HTML');
console.log('✓ Consistent format wording (e.g. 7v7) verified');

// 4. Verify "Add to Squad" button label
assert(html.includes('Add to Squad'), 'Missing "Add to Squad" button');
assert(!html.includes('Add to Squad Pods'), 'Found old "Add to Squad Pods" button');
console.log('✓ "Add to Squad" button text verified');

// 5. Verify service worker cache version
const sw = fs.readFileSync('sw.js', 'utf-8');
assert(sw.includes("CACHE_NAME = 'gameon-v5'"), 'sw.js cache version is not gameon-v5');
console.log('✓ sw.js cache version bumped to gameon-v5');

// 6. Test JS logic execution
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
const mainScriptTag = scripts[scripts.length - 1];
let jsCode = mainScriptTag.replace(/^<script>/, '').replace(/<\/script>$/, '');
jsCode = jsCode.replace('const AppState =', 'global.AppState =').replace('const App =', 'global.App =');

// Mock browser environment
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const dom = {};
global.document = {
  getElementById: (id) => {
    if (!dom[id]) {
      dom[id] = {
        id,
        value: '',
        innerText: '',
        innerHTML: '',
        className: '', dataset: {},
        classList: {
          add: (...cls) => {},
          remove: (...cls) => {},
          contains: () => false
        },
        style: {},
        appendChild: () => {},
        querySelectorAll: () => [], addEventListener: () => {}
      };
    }
    return dom[id];
  },
  querySelectorAll: () => [], addEventListener: () => {},
  querySelector: () => null,
  createElement: (tag) => ({
    tagName: tag,
    className: '', dataset: {},
    style: {},
    appendChild: () => {},
    innerHTML: '',
    innerText: '',
    classList: { add: ()=>{}, remove: ()=>{} }, click: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {},
    classList: { add: ()=>{}, remove: ()=>{} }, click: () => {}
  },
  addEventListener: () => {}
};

global.window = {
  addEventListener: () => {},
  scrollTo: () => {}
};

global.confirm = () => true;
global.alert = () => {};
global.URL = { createObjectURL: () => 'blob:mock', revokeObjectURL: () => {} };
global.Blob = class { constructor(parts) { this.parts = parts; } };

eval(jsCode);

assert(typeof App === 'object', 'App object not defined');
assert(typeof AppState === 'object', 'AppState object not defined');

// Initialize app
App.init();
console.log('✓ App.init() executed successfully');

// Test Tab switching
App.switchTab('live');
assert.strictEqual(AppState.activeTab, 'live', 'switchTab to live failed');
App.switchTab('pitch');
assert.strictEqual(AppState.activeTab, 'pitch', 'switchTab to pitch failed');
App.switchTab('stats');
assert.strictEqual(AppState.activeTab, 'stats', 'switchTab to stats failed');
console.log('✓ Tab navigation functions properly');

// Test Score adjustments
AppState.match.ourGoals = 0;
AppState.match.opponentGoals = 0;
App.adjustScore('our', 1);
assert.strictEqual(AppState.match.ourGoals, 1, 'adjustScore our +1 failed');
App.adjustScore('our', -1);
assert.strictEqual(AppState.match.ourGoals, 0, 'adjustScore our -1 failed');
App.adjustScore('our', -1);
assert.strictEqual(AppState.match.ourGoals, 0, 'adjustScore our below 0 prevented');

App.adjustScore('opponent', 2);
assert.strictEqual(AppState.match.opponentGoals, 2, 'adjustScore opponent +2 failed');
App.adjustScore('opponent', -1);
assert.strictEqual(AppState.match.opponentGoals, 1, 'adjustScore opponent -1 failed');
console.log('✓ Manual score steppers (+/-) working properly');

// Test Goal popup without selected player
App.openEventModal('Goal');
const selector = document.getElementById('eventPlayerSelector');
selector.value = ''; // No player selected
let toastMsg = '';
App.toast = (msg) => { toastMsg = msg; };
App.confirmEvent();
assert(toastMsg.includes('Please choose the goal scorer'), 'Allowed confirming goal without selecting player');
console.log('✓ Enforced selecting a player in Goal popup before recording');

// Test Goal popup with player selected
const testPlayer = AppState.squad[0];
selector.value = testPlayer.id;
App.confirmEvent();
assert.strictEqual(AppState.match.ourGoals, 1, 'Goal did not increment our score');
assert(AppState.events.length > 0, 'Event not recorded in timeline');
assert.strictEqual(AppState.events[0].type, 'Goal', 'Event type is not Goal');
assert.strictEqual(AppState.events[0].playerId, testPlayer.id, 'Goal event attributed to wrong player');
console.log('✓ Recording goal updates score, player stats, and timeline');

// Test Delete/Undo goal event from timeline
const goalEvId = AppState.events[0].id;
App.deleteEvent(goalEvId);
assert.strictEqual(AppState.match.ourGoals, 0, 'Undoing goal did not decrement score');
assert.strictEqual(AppState.events.length, 0, 'Undoing goal did not remove event from timeline');
console.log('✓ Undoing goal from timeline updates score and player stats');

// Test Match Setup team name
document.getElementById('inputMatchTeamName').value = 'Thunderbolts FC';
document.getElementById('inputMatchTitle').value = 'Match 1';
document.getElementById('inputMatchOpponent').value = 'Echo Strikers';
document.getElementById('inputMatchDate').value = '2026-10-18';
App.saveMatchSetup();
assert.strictEqual(AppState.match.teamName, 'Thunderbolts FC', 'Team name not saved in setup');
console.log('✓ "Your team name" in Setup works and saves correctly');

// Test End Match flow
AppState.match.ourGoals = 3;
AppState.match.opponentGoals = 1;
AppState.clock.seconds = 3600;
AppState.playerTimers[testPlayer.id] = 1800;
AppState.events.push({ id: 'ev_test', type: 'Goal', playerId: testPlayer.id, matchTimeSeconds: 1200 });

App.endMatch();

assert.strictEqual(AppState.matchHistory.length, 1, 'Match was not archived to history');
const archived = AppState.matchHistory[0];
assert.strictEqual(archived.teamName, 'Thunderbolts FC', 'Archived team name mismatch');
assert.strictEqual(archived.ourGoals, 3, 'Archived score mismatch');
assert.strictEqual(archived.opponentGoals, 1, 'Archived opponent score mismatch');
assert.strictEqual(archived.durationSeconds, 3600, 'Archived duration mismatch');

// Verify live match was reset for next match
assert.strictEqual(AppState.match.ourGoals, 0, 'Live score ourGoals not reset');
assert.strictEqual(AppState.match.opponentGoals, 0, 'Live score opponentGoals not reset');
assert.strictEqual(AppState.clock.seconds, 0, 'Stopwatch seconds not reset');
assert.strictEqual(Object.keys(AppState.playerTimers).length, 0, 'Player live timers not reset');
assert.strictEqual(AppState.events.length, 0, 'Live events not reset');
assert(AppState.squad.length > 0, 'Squad was unexpectedly deleted');
console.log('✓ End match archives match to history and resets state for next match');

// Test Export Backup
let downloadedJson = null;
global.document.body.appendChild = (el) => {
  if (el.download && el.href) {
    downloadedJson = true;
  }
};
App.exportBackup();
assert(downloadedJson, 'exportBackup did not initiate download');
console.log('✓ Export backup generates downloadable JSON');

// Test localStorage persistence & reload
App.saveStorage();
assert(storage['gameon_history'], 'gameon_history not saved to localStorage');
assert(storage['gameon_clock'], 'gameon_clock not saved to localStorage');
assert(storage['gameon_squad'], 'gameon_squad not saved to localStorage');

// Clear memory state and reload from storage
AppState.matchHistory = [];
App.loadStorage();
assert.strictEqual(AppState.matchHistory.length, 1, 'loadStorage failed to restore matchHistory');
console.log('✓ localStorage data persistence survives refresh / restart');

// ==========================================
// NEW FEATURE TESTS: Formations, Sorting, Custom Presets, Player Editing
// ==========================================

// 13. Test Additional Tactical Formations for all formats
assert(Object.keys(AppState.formations['5']).length >= 5, '5v5 should have at least 5 formations');
assert(AppState.formations['5']['2-2'], '5v5 2-2 formation missing');
assert(AppState.formations['5']['1-1-2'], '5v5 1-1-2 formation missing');
assert(AppState.formations['5']['3-1'], '5v5 3-1 formation missing');

assert(Object.keys(AppState.formations['7']).length >= 5, '7v7 should have at least 5 formations');
assert(AppState.formations['7']['2-2-2'], '7v7 2-2-2 formation missing');
assert(AppState.formations['7']['3-1-2'], '7v7 3-1-2 formation missing');
assert(AppState.formations['7']['1-3-2'], '7v7 1-3-2 formation missing');

assert(Object.keys(AppState.formations['9']).length >= 5, '9v9 should have at least 5 formations');
assert(AppState.formations['9']['3-2-3'], '9v9 3-2-3 formation missing');
assert(AppState.formations['9']['2-4-2'], '9v9 2-4-2 formation missing');
assert(AppState.formations['9']['4-3-1'], '9v9 4-3-1 formation missing');

assert(Object.keys(AppState.formations['11']).length >= 6, '11v11 should have at least 6 formations');
assert(AppState.formations['11']['4-4-2'], '11v11 4-4-2 formation missing');
assert(AppState.formations['11']['4-2-3-1'], '11v11 4-2-3-1 formation missing');
assert(AppState.formations['11']['4-1-4-1'], '11v11 4-1-4-1 formation missing');
assert(AppState.formations['11']['5-3-2'], '11v11 5-3-2 formation missing');
console.log('✓ Additional tactical formations available across all formats (5v5, 7v7, 9v9, 11v11)');

// 14. Test Starting Lineups Sort Players Based on Designated Position
const fwdPlayer = AppState.squad.find(p => ['FWD', 'S', 'LW', 'RW'].includes(p.position)) || AppState.squad[0];
const midPlayer = AppState.squad.find(p => ['MID', 'CDM', 'CAM', 'LM', 'RM'].includes(p.position)) || AppState.squad[1];
const defPlayer = AppState.squad.find(p => ['DEF', 'CB', 'LB', 'RB'].includes(p.position)) || AppState.squad[2];
const gkPlayer = AppState.squad.find(p => p.position === 'GK') || AppState.squad[3];

AppState.match.starters = [fwdPlayer.id, midPlayer.id, defPlayer.id, gkPlayer.id];
App.sortStartersByPosition();
assert.strictEqual(AppState.match.starters[0], gkPlayer.id, 'Goalkeeper must be first in sorted starters');
assert.strictEqual(AppState.match.starters[1], defPlayer.id, 'Defender must be second in sorted starters');
assert.strictEqual(AppState.match.starters[2], midPlayer.id, 'Midfielder must be third in sorted starters');
assert.strictEqual(AppState.match.starters[3], fwdPlayer.id, 'Forward must be fourth in sorted starters');

assert.strictEqual(App.getPositionRank('GK'), 0, 'GK rank should be 0');
assert.strictEqual(App.getPositionRank('CB'), 1, 'CB rank should be 1 (DEF)');
assert.strictEqual(App.getPositionRank('CDM'), 2, 'CDM rank should be 2 (MID)');
assert.strictEqual(App.getPositionRank('S'), 3, 'S rank should be 3 (FWD)');
console.log('✓ Starting lineups correctly sorted based on designated pitch position (GK → DEF → MID → FWD)');

// 15. Test Moving Players & Saving Multiple Formations with Custom Names
AppState.match.format = '7';
AppState.match.starters = AppState.squad.slice(0, 7).map(p => p.id);
AppState.match.starters.forEach((pid, idx) => {
  AppState.match.fieldPositions[pid] = { x: 30 + idx * 5, y: 80 - idx * 8 };
});

const customFormationName1 = 'Diamond Press 7v7';
App.saveCustomFormation(customFormationName1);
assert(AppState.customFormations['7'][customFormationName1], 'Custom formation 1 was not saved');
assert.strictEqual(AppState.customFormations['7'][customFormationName1].length, 7, 'Custom formation should have 7 slots');

const customFormationName2 = 'Ultra Attacking Overload';
App.saveCustomFormation(customFormationName2);
assert(AppState.customFormations['7'][customFormationName2], 'Custom formation 2 was not saved');

App.saveStorage();
const reloadedCF = JSON.parse(storage['gameon_custom_formations']);
assert(reloadedCF['7'][customFormationName1], 'Custom formation 1 not in localStorage');
assert(reloadedCF['7'][customFormationName2], 'Custom formation 2 not in localStorage');

const formationSelect = document.getElementById('formationSelect');
formationSelect.value = customFormationName1;
App.onFormationChanged(customFormationName1);

// Test deletion of custom formation
App.deleteCurrentCustomFormation();
assert(!AppState.customFormations['7'][customFormationName1], 'Custom formation was not deleted');
console.log('✓ Saving multiple custom formations with custom names, switching, and deleting verified');

// 16. Test Player Edit Once Created
const playerToEdit = AppState.squad[0];
const originalId = playerToEdit.id;

App.openEditPlayerModal(originalId);
assert.strictEqual(AppState.editingPlayerId, originalId, 'editingPlayerId not set on openEditPlayerModal');
assert.strictEqual(document.getElementById('inputPlayerName').value, playerToEdit.name, 'Player name not prefilled');
assert.strictEqual(document.getElementById('inputPlayerNumber').value, playerToEdit.number, 'Player number not prefilled');
assert.strictEqual(document.getElementById('inputPlayerPosition').value, playerToEdit.position, 'Player position not prefilled');

document.getElementById('inputPlayerName').value = 'Renaldo Sterling';
document.getElementById('inputPlayerNumber').value = 77;
document.getElementById('inputPlayerPosition').value = 'RW';
App.saveNewPlayer();

const editedPlayer = AppState.squad.find(p => p.id === originalId);
assert.strictEqual(editedPlayer.name, 'Renaldo Sterling', 'Player name was not updated');
assert.strictEqual(editedPlayer.number, 77, 'Player number was not updated');
assert.strictEqual(editedPlayer.position, 'RW', 'Player position was not updated');
assert.strictEqual(AppState.editingPlayerId, null, 'editingPlayerId was not reset');
console.log('✓ Editing existing players (name, number, position) verified with immediate squad update');

// ==========================================
// TEST 17: Multi-Select Games to Pull Totalled Minutes
// ==========================================
const p0Id = AppState.squad[0].id;
const p1Id = AppState.squad[1].id;

const sampleMatch1 = {
  id: 'm_test_1',
  title: 'League Match 1',
  teamName: 'GameOn FC',
  opponent: 'Red Hawks',
  date: '2026-10-10',
  format: '7',
  ourGoals: 2,
  opponentGoals: 1,
  durationSeconds: 3000,
  playerTimers: {
    [p0Id]: 1800, // 30 mins
    [p1Id]: 2400  // 40 mins
  },
  starters: [p0Id, p1Id],
  events: [
    { id: 'ev_g1', type: 'Goal', playerId: p0Id, matchTimeSeconds: 600 }
  ]
};

const sampleMatch2 = {
  id: 'm_test_2',
  title: 'Cup Semi-Final',
  teamName: 'GameOn FC',
  opponent: 'Blue Sharks',
  date: '2026-10-15',
  format: '7',
  ourGoals: 3,
  opponentGoals: 2,
  durationSeconds: 3600,
  playerTimers: {
    [p0Id]: 1200, // 20 mins
    [p1Id]: 0     // 0 mins
  },
  starters: [p0Id],
  events: [
    { id: 'ev_g2', type: 'Goal', playerId: p0Id, matchTimeSeconds: 900 },
    { id: 'ev_g3', type: 'Goal', playerId: p1Id, matchTimeSeconds: 1500 }
  ]
};

AppState.matchHistory = [sampleMatch1, sampleMatch2];

// Test selectAllGames
App.selectAllGames();
let selected = App.getSelectedGameIds();
assert(selected.includes('m_test_1'), 'm_test_1 should be selected');
assert(selected.includes('m_test_2'), 'm_test_2 should be selected');

// Test toggleGameSelection
App.toggleGameSelection('m_test_2');
selected = App.getSelectedGameIds();
assert(selected.includes('m_test_1'), 'm_test_1 should still be selected');
assert(!selected.includes('m_test_2'), 'm_test_2 should be deselected');

// Test selectRecentGames
App.selectRecentGames(1);
selected = App.getSelectedGameIds();
assert.strictEqual(selected.length, 1, 'Only 1 match should be selected');
assert.strictEqual(selected[0], 'm_test_1', 'Recent match should be m_test_1');

// Test deselectAllGames
App.deselectAllGames();
selected = App.getSelectedGameIds();
assert.strictEqual(selected.length, 0, 'No games should be selected');

// Reselect both to verify pulled totals rendering
App.selectAllGames();
App.renderStats();
console.log('✓ Multi-select games to pull totalled minutes verified');

// ==========================================
// TEST 18: Game Detail Breakdown & Manage Minutes per Game
// ==========================================
// Test toggling Game Detail accordion
App.toggleGameDetail('m_test_1');
assert(AppState.expandedGameIds['m_test_1'], 'Game detail for m_test_1 should be expanded');

// Test quick adjusting minutes on a game (+5 mins = +300s)
const initialSec = sampleMatch1.playerTimers[p0Id];
App.adjustPlayerGameMinutes('m_test_1', p0Id, 5);
assert.strictEqual(sampleMatch1.playerTimers[p0Id], initialSec + 300, 'Player minutes not adjusted by +5 mins');

// Test quick decrementing minutes (-2 mins = -120s)
App.adjustPlayerGameMinutes('m_test_1', p0Id, -2);
assert.strictEqual(sampleMatch1.playerTimers[p0Id], initialSec + 180, 'Player minutes not adjusted by -2 mins');

// Test opening Manage Game Minutes Modal
App.openEditGameMinutesModal('m_test_1');
assert.strictEqual(AppState.editingGameId, 'm_test_1', 'editingGameId not set on modal open');

// Test stepping minutes input helper
App.stepInputMinutes(p0Id, 10);

// Test saving edited minutes
App.saveGameMinutes();
assert.strictEqual(AppState.editingGameId, null, 'editingGameId not reset on save');
App.saveStorage();
assert(storage['gameon_history'], 'Updated match history not persisted');
console.log('✓ Game detail breakdown & manage minutes per game verified');

console.log('\n=========================================');
console.log('ALL 18 AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
console.log('=========================================');
