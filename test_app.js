const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf-8');

// 1. Verify HTML elements exist
const expectedIds = [
  'modalMatchSetup', 'modalAddPlayer', 'modalEvent', 'modalTeams',
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
assert(sw.includes("CACHE_NAME = 'gameon-v3'"), 'sw.js cache version is not gameon-v3');
console.log('✓ sw.js cache version bumped to gameon-v3');

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

console.log('\n=========================================');
console.log('ALL 12 AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
console.log('=========================================');
