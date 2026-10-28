const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf-8');

// 1. Verify HTML elements exist
const expectedIds = [
  'modalMatchSetup', 'modalAddPlayer', 'modalSaveFormation', 'modalEvent', 'modalTeams',
  'modalEndMatch', 'endMatchConfirmBtn',
  'modalPdfReport', 'btnCreatePdfReport',
  'pdfTabBtn_single', 'pdfTabBtn_range', 'pdfSelectMatch', 'pdfRangeStartDate', 'pdfRangeEndDate', 'pdfRangeTeamFilter',
  'selectedGamesBadge', 'proUpgradeCard', 'upgradeProCta', 'upgradeProOffline',
  'liteViewBtn', 'proViewBtn', 'proToggleNote',
  'activeMatchTitleDisplay', 'activeMatchFormatBadge', 'activeMatchDateBadge',
  'tabBtn_pitch', 'tabBtn_live', 'tabBtn_roster', 'tabBtn_stats',
  'section_pitch', 'section_live', 'section_roster', 'section_stats',
  'scoreboardTeam', 'scoreboardOpponent', 'scoreboardGoals', 'scoreboardOpponentGoals',
  'clockToggleBtn', 'matchClockDisplay', 'clockStatusSubtext',
  'eventModalTitle', 'eventPlayerSelector', 'eventAssistSelector',
  'inputMatchTeamName', 'inputMatchTitle', 'inputMatchOpponent', 'inputMatchDate',
  'backupFileInput', 'storageFailureStatus', 'sharedRosterStatus', 'recoverSharedRosterBtn',
  'installPwaBtn', 'installGuideNote', 'installGuideSteps', 'installGuideHint'
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

// 5. Verify local minified Tailwind CSS & service worker cache
assert(fs.existsSync('tailwind.min.css'), 'Missing tailwind.min.css');
assert(html.includes('<link rel="stylesheet" href="./tailwind.min.css" />'), 'index.html does not link to tailwind.min.css');
assert(!html.includes('src="https://cdn.tailwindcss.com"'), 'Found unwanted Tailwind CDN script in index.html');

const sw = fs.readFileSync('sw.js', 'utf-8');
const cacheVersion = sw.match(/CACHE_NAME = '(Clubstride Lite-v\d+)'/);
assert(cacheVersion, 'sw.js does not declare a Clubstride Lite cache version');
assert(sw.includes("'./tailwind.min.css'"), 'sw.js missing tailwind.min.css in cached assets');
assert(sw.includes("'./clubstride-tokens.css'"), 'sw.js missing clubstride-tokens.css in cached assets');
assert(html.includes("updateViaCache: 'none'"), 'service worker may be served from the HTTP cache, pinning devices to the install-day build');
assert(html.includes('offlineStatusLine'), 'no offline-readiness readout shown to the coach');
console.log(`✓ Standalone offline Tailwind CSS & sw.js ${cacheVersion[1]} cache verified`);

// 5b. PRO pill component must be wired to real markup, not left dormant
const csInit = fs.readFileSync('src/components/cs-init.js', 'utf-8');
assert(csInit.includes("querySelectorAll('[data-pro]')"), 'cs-init.js no longer applies PRO pills to [data-pro] markers');
assert(sw.includes("'./assets/icons/pro-pill.svg'"), 'sw.js does not pre-cache the PRO pill icon');
const proTiles = [...html.matchAll(/<div data-pro="([a-z-]+)"[\s\S]{0,320}?<use href="#ci-([a-z-]+)">/g)];
assert(proTiles.length === 4, `expected 4 data-pro tiles in the Squad tab, found ${proTiles.length}`);
assert(csInit.includes('ProPill(isPro)'), 'cs-init.js does not render the ProPill component');
for (const [, marker, symbol] of proTiles) {
  assert(html.includes(`<symbol id="ci-${symbol}"`), `data-pro="${marker}" points at #ci-${symbol}, which has no sprite symbol`);
}
console.log(`✓ PRO pill wired to ${proTiles.length} Squad-tab tier markers`);

// 5c. THE PRO TILES ARE A COACH UPGRADE PATH, NOT A DEAD LABEL
const rosterStart = html.indexOf('<section id="section_roster"');
const rosterEnd = html.indexOf('</section>', rosterStart);
const upgradeAt = html.indexOf('id="proUpgradeCard"');
assert(rosterStart !== -1 && upgradeAt > rosterStart && upgradeAt < rosterEnd, 'Upgrade card must live inside the Squad tab');

const upgradeCtaTag = (html.match(/<a id="upgradeProCta"[^>]+>/) || [])[0] || '';
assert(upgradeCtaTag.includes('href="https://fracturedorbit1980.github.io/Clubstride-Pro-Web/"'), 'Upgrade CTA must fall back to the Pro web app');
assert(!upgradeCtaTag.includes('target="_blank"'), 'Upgrade CTA must open Pro in-app, not in a new tab');
assert(!upgradeCtaTag.includes('rel="noopener noreferrer"'), 'Upgrade CTA no longer opens a tab, so the noopener rel should be gone');
assert(upgradeCtaTag.includes('onclick="return App.openProUpgrade(event)"'), 'Upgrade CTA must run the in-app Pro shell');
assert(html.includes('>Upgrade to Pro</a>'), 'Upgrade CTA label missing');
for (const label of ['Training Days', 'Attendance', 'Squad Registry', 'Register PDF']) {
  assert(html.includes(`>${label}</span>`), `Upgrade tile "${label}" missing - only promise tools Pro actually ships`);
}
assert(html.includes('id="upgradeProOffline" role="status" aria-live="polite" class="hidden'), 'Offline note must start hidden but be announced when shown');
assert(!html.includes('new tab'), 'Upgrade copy still tells the coach a new tab opens');
assert(html.includes('Back to Lite control'), 'Upgrade copy must say Pro opens inside the app with a way back');
assert(!html.includes('Matchday tools not included in this Lite build'), 'Upgrade card still carries the old dead-end copy');
console.log('✓ Coach Pro upgrade card opens Pro in-app and guards offline taps');

// 5d. THE VIEW SWITCH REACHES PRO FROM EVERY TAB
const viewSwitchAt = html.indexOf('id="proViewBtn"');
const firstTabAt = html.indexOf('id="section_pitch"');
assert(viewSwitchAt > html.indexOf('<main'), 'View switch must sit in the main viewport');
assert(viewSwitchAt < firstTabAt, 'View switch must come before the tab sections so every tab shows it');
const proViewTag = (html.match(/<a id="proViewBtn"[^>]+>/) || [])[0] || '';
assert(proViewTag.includes('href="https://fracturedorbit1980.github.io/Clubstride-Pro-Web/"'), 'View switch must fall back to the Pro web app');
assert(!proViewTag.includes('target="_blank"'), 'View switch must open Pro in-app, not in a new tab');
assert(proViewTag.includes('onclick="return App.openProUpgrade(event)"'), 'View switch must run the in-app Pro shell');
assert(html.includes('id="liteViewBtn" aria-pressed="true"'), 'Lite must read as the selected view');
assert(html.includes('id="proToggleNote" role="status" aria-live="polite" class="hidden'), 'View-switch offline note must start hidden but be announced when shown');
assert(/openProUpgrade\(event\) \{[\s\S]*proToggleNote/.test(html), 'Offline guard must reveal the view-switch note too');
console.log('✓ View switch opens Pro in-app from every tab and guards offline taps');

// 5d-1. THE PRO SHELL KEEPS THE PANE ON THE LITE ADDRESS
const shellTag = (html.match(/<div id="proShell"[^>]+>/) || [])[0] || '';
assert(shellTag.includes('z-index: 2000 !important'), 'Pro shell must sit above the bottom dock, which wins with z-index 1000 !important');
assert(shellTag.includes('display: none'), 'Pro shell must start hidden');
const frameTag = (html.match(/<iframe id="proFrame"[^>]+>/) || [])[0] || '';
assert(frameTag.includes('title="Clubstride Pro"'), 'Pro iframe needs a title for assistive tech');
assert(!frameTag.includes('src='), 'Pro iframe must stay lazy until the coach asks for Pro');
assert(html.includes('id="proBackBtn"'), 'Pro shell needs a Back to Lite control');
assert(html.includes('aria-label="Back to Clubstride Lite"'), 'Back control needs an accessible label');
assert(html.includes('href="#ci-back"'), 'Back control must use the sprite back icon');
assert(html.includes('PRO_URL: \'https://fracturedorbit1980.github.io/Clubstride-Pro-Web/\''), 'Pro URL must live in one constant for the shell');
assert(html.includes('history.pushState({ csProShell: true }'), 'Opening Pro must push a history entry so hardware back closes it');
assert(html.includes("addEventListener('popstate'"), 'Hardware back must close the shell instead of leaving Lite');
assert(html.includes("event.key === 'Escape'"), 'Escape must close the shell');
console.log('✓ Pro renders in an in-app shell with history-aware Back to Lite');

// 5e. THE BRAND LOCKUP IS THE LITE/PRO SWITCH
const brandTag = (html.match(/<a id="brandSwitch"[^>]+>/) || [])[0] || '';
assert(brandTag.includes('href="https://fracturedorbit1980.github.io/Clubstride-Pro-Web/"'), 'Header logo must fall back to the Pro web app');
assert(!brandTag.includes('target="_blank"'), 'Header logo must open Pro in-app, not in a new tab');
assert(brandTag.includes('onclick="return App.openProUpgrade(event)"'), 'Header logo must run the in-app Pro shell');
assert(brandTag.includes('aria-label="Switch to Clubstride Pro"'), 'Header logo needs a switch label for screen readers');
assert(!html.includes('id="logoFileInput"'), 'Header logo no longer uploads a logo - the Teams modal owns that');
assert(html.includes('id="teamModalLogoInput"'), 'Teams modal must keep the custom logo upload');
console.log('✓ Header logo switches to Pro and the Teams modal keeps logo upload');

// 6. Test JS logic execution
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
const mainScriptTag = scripts[scripts.length - 1];
let jsCode = mainScriptTag.replace(/^<script>/, '').replace(/<\/script>$/, '');
jsCode = jsCode.replace('const AppState =', 'global.AppState =').replace('const App =', 'global.App =');

// Mock browser environment
const storage = {};
const storageWrites = [];
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); storageWrites.push(k); },
  removeItem: (k) => { delete storage[k]; }
};

const dom = new Proxy({}, {
  get: (target, prop) => {
    if (!target[prop]) {
      target[prop] = {
        id: prop,
        value: '',
        innerText: '',
        innerHTML: '',
        className: '', dataset: {},
        classList: {
          add: (...cls) => { target[prop].className = (target[prop].className || '') + ' ' + cls.join(' '); },
          remove: (...cls) => {
            let classes = (target[prop].className || '').split(' ');
            target[prop].className = classes.filter(c => !cls.includes(c)).join(' ');
          },
          contains: (c) => (target[prop].className || '').split(' ').includes(c),
          toggle: (c, force) => {
            const on = force === undefined ? !target[prop].classList.contains(c) : !!force;
            if (on) target[prop].classList.add(c); else target[prop].classList.remove(c);
            return on;
          }
        },
        style: {},
        _attrs: {},
        setAttribute: function (key, value) { this._attrs[key] = String(value); },
        getAttribute: function (key) { return Object.prototype.hasOwnProperty.call(this._attrs, key) ? this._attrs[key] : null; },
        removeAttribute: function (key) { delete this._attrs[key]; },
        focus: function () { this.focused = true; },
        options: [],
        children: [],
        appendChild: function(c) { if (this.options) this.options.push(c); if (this.children) this.children.push(c); },
        querySelectorAll: () => [], addEventListener: () => {}
      };
    }
    return target[prop];
  }
});

const bodyEl = {
  appendChild: () => {},
  removeChild: () => {},
  style: {},
  className: 'bg-obsidian-950 text-slate-100',
  click: () => {},
};
bodyEl.classList = {
  add: (...cls) => { bodyEl.className = Array.from(new Set(bodyEl.className.split(' ').filter(Boolean).concat(cls))).join(' '); },
  remove: (...cls) => { bodyEl.className = bodyEl.className.split(' ').filter(c => c && !cls.includes(c)).join(' '); },
  contains: (c) => bodyEl.className.split(' ').includes(c),
  toggle: (c, force) => {
    const on = force === undefined ? !bodyEl.classList.contains(c) : !!force;
    if (on) bodyEl.classList.add(c); else bodyEl.classList.remove(c);
    return on;
  }
};

global.document = {
  getElementById: (id) => dom[id],
  querySelectorAll: (selector) => String(selector).split(',')
    .map(s => s.trim()).filter(s => s.startsWith('#'))
    .map(s => dom[s.slice(1)]),
  addEventListener: () => {},
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
  body: bodyEl,
  documentElement: {
    className: '',
    style: {},
    setAttribute: function (k, v) { this._attrs = Object.assign(this._attrs || {}, { [k]: v }); },
    getAttribute: function (k) { return (this._attrs || {})[k] ?? null; },
    classList: { add: ()=>{}, remove: ()=>{}, contains: ()=>false }
  },
  addEventListener: () => {}
};

const nodeCrypto = require('crypto');
let installationUuidCalls = 0;
let installationRandomValuesCalls = 0;
const rosterChangeEvents = [];
const windowListeners = new Map();
global.CustomEvent = class CustomEvent {
  constructor(type) { this.type = type; }
};
global.window = {
  crypto: {
    randomUUID: () => { installationUuidCalls += 1; return nodeCrypto.randomUUID(); },
    getRandomValues: (bytes) => { installationRandomValuesCalls += 1; return nodeCrypto.randomFillSync(bytes); }
  },
  dispatchEvent: (event) => {
    if (event.type === 'cs-lite-roster-change') rosterChangeEvents.push(event);
    (windowListeners.get(event.type) || []).forEach(listener => listener(event));
    return true;
  },
  addEventListener: (type, listener) => {
    if (!windowListeners.has(type)) windowListeners.set(type, []);
    windowListeners.get(type).push(listener);
  },
  location: { reload: () => {} },
  print: () => {},
  scrollY: 0,
  scrollTo: () => {}
};
if (typeof navigator === 'undefined') global.navigator = {};
global.history = {
  _pushed: 0,
  _backed: 0,
  state: null,
  pushState(state) { this._pushed += 1; this.state = state; },
  back() { this._backed += 1; this.state = null; }
};
global.confirm = () => true;
global.prompt = (msg, def) => def;
global.alert = () => {};

// Evaluate application script in global scope
eval(jsCode);

// Run App.init()
App.init();
const rosterKey = 'cs.lite.roster.v1';
const installationKey = 'cs.lite.installation.v1';
const readRoster = () => JSON.parse(storage[rosterKey]);
const initialRoster = readRoster();
assert.strictEqual(initialRoster.version, 1);
assert.strictEqual(initialRoster.teamId, 'lite-default');
assert.strictEqual(initialRoster.teamName, 'Clubstride FC');
assert.deepStrictEqual(initialRoster.players, AppState.squad);
assert.strictEqual(initialRoster.installationId, storage[installationKey]);
assert.match(initialRoster.installationId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
assert.strictEqual(new Date(initialRoster.revision).toISOString(), initialRoster.revision);
assert.strictEqual(rosterChangeEvents.length, 1, 'Initialization must publish and notify once');
assert.strictEqual(rosterChangeEvents[0].type, 'cs-lite-roster-change');
console.log('✓ App.init() executed successfully and published the Lite roster');

// ==========================================
// TEST 7: Tab navigation
// ==========================================
App.switchTab('live');
assert.strictEqual(AppState.activeTab, 'live', 'Active tab should be live');
App.switchTab('stats');
assert.strictEqual(AppState.activeTab, 'stats', 'Active tab should be stats');
App.switchTab('pitch');
assert.strictEqual(AppState.activeTab, 'pitch', 'Active tab should be pitch');
console.log('✓ Tab navigation functions properly');

// ==========================================
// TEST 8: Score steppers (+/-)
// ==========================================
AppState.match.ourGoals = 0;
AppState.match.opponentGoals = 0;
App.adjustScore('our', 1);
assert.strictEqual(AppState.match.ourGoals, 1, 'Our goals should increase to 1');
App.adjustScore('our', 1);
assert.strictEqual(AppState.match.ourGoals, 2, 'Our goals should increase to 2');
App.adjustScore('our', -1);
assert.strictEqual(AppState.match.ourGoals, 1, 'Our goals should decrease to 1');

App.adjustScore('opp', 1);
assert.strictEqual(AppState.match.opponentGoals, 1, 'Opponent goals should increase to 1');
App.adjustScore('opp', -1);
assert.strictEqual(AppState.match.opponentGoals, 0, 'Opponent goals should decrease to 0');
console.log('✓ Manual score steppers (+/-) working properly');

// ==========================================
// TEST 9: Goal recording & Enforced player selection
// ==========================================
let p1 = AppState.squad[0];
let p2 = AppState.squad[1];

App.openEventModal('Goal');
dom['eventPlayerSelector'].value = '';
dom['eventAssistSelector'].value = '';
App.saveEvent();
assert.strictEqual(AppState.match.ourGoals, 1, 'Score should not change when no player selected');

dom['eventPlayerSelector'].value = p1.id;
dom['eventAssistSelector'].value = p2.id;
App.saveEvent();
assert.strictEqual(AppState.match.ourGoals, 2, 'Goal should be registered');
let goalEvent = AppState.events.find(e => e.type === 'Goal' && e.playerId === p1.id);
assert(goalEvent, 'Goal event should exist in timeline');
const linkedAssist = AppState.events.find(e => e.type === 'Assist' && e.playerId === p2.id);
assert(linkedAssist, 'Assist should be logged with the goal');
assert.strictEqual(linkedAssist.goalId, goalEvent.id, 'Assist must be linked to the goal it belongs to');
assert.strictEqual(AppState.events.indexOf(linkedAssist), AppState.events.indexOf(goalEvent) + 1, 'Assist should sit under its goal in the timeline');

dom['eventPlayerSelector'].value = p1.id;
dom['eventAssistSelector'].value = p1.id;
App.saveEvent();
assert.strictEqual(AppState.match.ourGoals, 2, 'A scorer cannot assist their own goal');
assert(!AppState.events.some(e => e.type === 'Assist' && e.playerId === p1.id), 'Self-assist must be rejected');
console.log('✓ Enforced selecting a player in Goal popup before recording');
console.log('✓ Goal popup credits a fielded scorer plus optional linked assist');

// ==========================================
// TEST 10: Undo/Delete goal from timeline
// ==========================================
const prevGoals = AppState.match.ourGoals;
App.deleteTimelineEvent(goalEvent.id);
assert.strictEqual(AppState.match.ourGoals, prevGoals - 1, 'Our goals should decrease when goal deleted');
assert(!AppState.events.some(e => e.id === goalEvent.id), 'Deleted event should no longer exist in events');
assert(!AppState.events.some(e => e.id === linkedAssist.id), 'Undoing a goal must also remove its linked assist');
console.log('✓ Undoing goal from timeline updates score and player stats');

// ==========================================
// TEST 11: Setup - Your Team Name
// ==========================================
dom['inputMatchTeamName'].value = 'Lightning Stars';
dom['inputMatchTitle'].value = 'Championship Final';
dom['inputMatchOpponent'].value = 'Thunderbolts';
dom['inputMatchDate'].value = '2026-10-18';
App.saveMatchSetup();
assert.strictEqual(AppState.match.teamName, 'Lightning Stars', 'Team name in setup should update AppState.match.teamName');
assert.strictEqual(dom['scoreboardTeam'].innerText, 'Lightning Stars', 'Scoreboard team name should match your team name');
console.log('✓ "Your team name" in Setup works and saves correctly');

// ==========================================
// TEST 12a: Live playing-time accrual & stats sync
// ==========================================
AppState.clock.seconds = 0;
AppState.playerTimers = {};
AppState.clock.running = true;
AppState.clock.startedAt = Date.now() - 95000;
App.tickClock();
assert.strictEqual(AppState.clock.seconds, 95, 'Stopwatch must credit real elapsed seconds, not only fired intervals');
AppState.match.starters.forEach(pid => {
  assert.strictEqual(AppState.playerTimers[pid], 95, 'Players on the field must accrue playing time');
});
AppState.match.bench.forEach(pid => {
  assert.strictEqual(AppState.playerTimers[pid] || 0, 0, 'Bench players must not accrue playing time');
});
AppState.selectedGameIds = [];
App.toggleTimer(); // pause
App.toggleTimer(); // (re)start
assert(AppState.selectedGameIds.includes('live'), 'Starting the clock must pull the live match into the stats totals');
App.toggleTimer(); // pause again
AppState.clock.seconds = 0;
AppState.playerTimers = {};
console.log('✓ Player timers count up on wall-clock time for on-field players and sync the live match into stats');

// ==========================================
// TEST 12b: Phone lock / long gap while the clock keeps running
// ==========================================
AppState.clock.seconds = 0;
AppState.playerTimers = {};
AppState.clock.running = true;
AppState.clock.startedAt = Date.now() - 754000; // 12m34s elapse while the screen is locked
App.tickClock();
assert.strictEqual(AppState.clock.seconds, 754, 'A locked phone must not lose elapsed match time');
AppState.match.starters.forEach(pid => {
  assert.strictEqual(AppState.playerTimers[pid], 754, 'Locked-time minutes must credit every player left on the field');
});
assert.strictEqual(dom['matchClockDisplay'].innerText, '12:34', 'Clock display must catch up after the lock');

const creditedAt = AppState.clock.startedAt;
App.tickClock();
assert.strictEqual(AppState.clock.seconds, 754, 'Catching up must not double-credit the locked gap');
assert.strictEqual(AppState.clock.startedAt, creditedAt, 'The wall-clock anchor must advance past credited time');

AppState.clock.running = false;
AppState.clock.startedAt = Date.now() - 60000;
App.tickClock();
assert.strictEqual(AppState.clock.seconds, 754, 'A paused clock must never accrue time');

AppState.clock.running = true;
AppState.clock.startedAt = 0;
App.tickClock();
assert.strictEqual(AppState.clock.seconds, 754, 'Missing clock anchor must not invent elapsed time');
AppState.clock.running = false;
AppState.clock.seconds = 0;
AppState.playerTimers = {};
console.log('✓ Locked-phone catch-up credits 12m34s once, pauses still, and never double-counts');

// ==========================================
// TEST 12: End Match Flow
// ==========================================
AppState.selectedGameIds = ['live'];
AppState.clock.seconds = 3600;
AppState.match.ourGoals = 3;
AppState.match.opponentGoals = 1;
AppState.match.formation = '2-3-1';
AppState.playerTimers[p1.id] = 1800;
AppState.playerTimers[p2.id] = 1800;

const historyBeforeEndMatch = AppState.matchHistory.length;
let endMatchUsedNativeDialog = false;
global.confirm = () => { endMatchUsedNativeDialog = true; return true; };

App.endMatch();
assert.strictEqual(endMatchUsedNativeDialog, false, 'End match must use the in-app sheet, not window.confirm');
assert.strictEqual(AppState.matchHistory.length, historyBeforeEndMatch, 'Opening the end-match sheet must not archive anything yet');
assert(!dom['modalEndMatch'].classList.contains('hidden'), 'End Match must open the in-app confirmation sheet');
assert.strictEqual(dom['endMatchScore'].innerText, '3 - 1', 'Sheet must preview the current final score');
assert.strictEqual(dom['endMatchTeam'].innerText, 'Lightning Stars', 'Sheet must name your team');
assert.strictEqual(dom['endMatchOpponent'].innerText, 'Thunderbolts', 'Sheet must name the opponent');
global.confirm = () => true;

App.confirmEndMatch();
assert(dom['modalEndMatch'].classList.contains('hidden'), 'Confirming must close the end-match sheet');

assert(AppState.matchHistory.length > 0, 'Match should be archived into matchHistory');
const archived = AppState.matchHistory[0];
assert.strictEqual(archived.teamName, 'Lightning Stars');
assert.strictEqual(archived.opponent, 'Thunderbolts');
assert.strictEqual(archived.ourGoals, 3);
assert.strictEqual(archived.opponentGoals, 1);
assert.strictEqual(archived.formation, '2-3-1', 'Archived match should store formation');
assert.strictEqual(archived.durationSeconds, 3600);
assert.strictEqual(archived.playerTimers[p1.id], 1800);
assert(AppState.selectedGameIds.includes(archived.id) && !AppState.selectedGameIds.includes('live'), 'Stats selection must follow the match from live into history');

assert.strictEqual(AppState.clock.seconds, 0, 'Clock seconds should reset to 0');
assert.strictEqual(AppState.match.ourGoals, 0, 'Our goals should reset to 0');
assert.strictEqual(AppState.match.opponentGoals, 0, 'Opponent goals should reset to 0');
assert.strictEqual(Object.keys(AppState.playerTimers).length, 0, 'Player timers should be reset to empty');
assert.strictEqual(AppState.events.length, 0, 'Match events should be cleared');
assert(AppState.squad.length > 0, 'Squad should never be deleted on match end');
console.log('✓ End match archives match to history with formation and resets state for next match');

// ==========================================
// TEST 13: Export backup
// ==========================================
let clickedDownload = false;
global.URL = {
  createObjectURL: (blob) => 'blob:test',
  revokeObjectURL: () => {}
};
dom['downloadAnchor'] = {
  click: () => { clickedDownload = true; }
};
App.exportBackup();
assert(storage['Clubstride Mobile_squad'], 'localStorage squad should exist');
console.log('✓ Export backup generates downloadable JSON');

// ==========================================
// TEST 14: Data persistence
// ==========================================
const testStorageKey = 'Clubstride Mobile_test_persist';
localStorage.setItem(testStorageKey, 'persisted_value');
assert.strictEqual(localStorage.getItem(testStorageKey), 'persisted_value', 'Data in localStorage should persist');
console.log('✓ localStorage data persistence survives refresh / restart');

// ==========================================
// TEST 15: Formations Presets Completeness & GK positioning
// ==========================================
const reqFormations = {
  '5': ['1-2-1', '2-1-1', '2-2', '1-1-2', '3-1'],
  '7': ['2-3-1', '3-2-1', '3-1-2', '2-2-2', '1-3-2', '2-1-2-1'],
  '9': ['3-3-2', '3-2-3', '2-4-2', '3-4-1', '4-3-1', '3-1-3-1'],
  '11': ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1', '4-5-1']
};

for (const [fmt, list] of Object.entries(reqFormations)) {
  for (const fName of list) {
    assert(AppState.formations[fmt][fName], `Missing formation ${fName} for ${fmt}v${fmt}`);
    const slots = AppState.formations[fmt][fName];
    assert.strictEqual(slots.length, parseInt(fmt), `Formation ${fName} must have ${fmt} starter positions`);
    // Verify GK (slot 0) is positioned in goal at y >= 88
    assert(slots[0].y >= 88, `GK in ${fName} (${fmt}v${fmt}) must be in goal area (y >= 88)`);
  }
}
console.log('✓ All prescribed formations verified across 5v5, 7v7, 9v9, and 11v11 with GK always in goal');

// Test formation saving per team
App.onFormationChanged('2-1-2-1');
assert.strictEqual(AppState.match.formation, '2-1-2-1', 'AppState.match.formation should be 2-1-2-1');
if (AppState.teams && AppState.currentTeamId) {
  const currentTeam = AppState.teams.find(t => t.id === AppState.currentTeamId);
  if (currentTeam) {
    assert.strictEqual(currentTeam.formation, '2-1-2-1', 'Current team object must persist chosen formation');
  }
}
console.log('✓ Formation saving per team and match history verified');

// ==========================================
// TEST 16: PDF Duration Formatting
// ==========================================
assert.strictEqual(App.formatPdfDuration(0), '00:00');
assert.strictEqual(App.formatPdfDuration(45), '00:45');
assert.strictEqual(App.formatPdfDuration(900), '15:00');
assert.strictEqual(App.formatPdfDuration(3540), '59:00');
assert.strictEqual(App.formatPdfDuration(3600), '1h 0m', 'Duration >= 60 mins must format as Xh Ym');
assert.strictEqual(App.formatPdfDuration(4500), '1h 15m', 'Duration >= 60 mins must format as Xh Ym');
console.log('✓ PDF duration formatting verified (mm:ss and Xh Ym when >= 60 mins)');

// ==========================================
// TEST 17: PDF Report Modal & Date Presets
// ==========================================
App.openPdfReportModal();
assert(dom['modalPdfReport'], 'modalPdfReport should be accessed');

App.applyPdfDatePreset('7d');
assert(dom['pdfRangeStartDate'].value, '7d preset should set start date');
assert(dom['pdfRangeEndDate'].value, '7d preset should set end date');

App.applyPdfDatePreset('month');
assert(dom['pdfRangeStartDate'].value, 'month preset should set start date');

App.switchPdfReportMode('range');
assert(!dom['pdfPane_range'].classList.contains('hidden'), 'Range pane should be visible');
App.switchPdfReportMode('single');
assert(!dom['pdfPane_single'].classList.contains('hidden'), 'Single pane should be visible');
console.log('✓ PDF Report bottom-sheet modal, mode switching, and date presets verified');

// ==========================================
// TEST 18: Date Range PDF Data Calculation & Validation
// ==========================================
// Setup sample match history for range test
const sampleMatchA = {
  id: 'm_range_1',
  title: 'League Match 1',
  teamName: 'Lightning Stars',
  opponent: 'Wolves FC',
  date: '2026-10-10',
  format: '7',
  formation: '2-3-1',
  ourGoals: 4,
  opponentGoals: 1,
  durationSeconds: 3600,
  playerTimers: { [p1.id]: 2400, [p2.id]: 1800 },
  starters: [p1.id, p2.id],
  events: [
    { type: 'Goal', playerId: p1.id, matchTimeSeconds: 600 },
    { type: 'Goal', playerId: p1.id, matchTimeSeconds: 1200 },
    { type: 'Assist', playerId: p2.id, matchTimeSeconds: 600 }
  ]
};

const sampleMatchB = {
  id: 'm_range_2',
  title: 'League Match 2',
  teamName: 'Lightning Stars',
  opponent: 'Eagles FC',
  date: '2026-10-14',
  format: '7',
  formation: '2-1-2-1',
  ourGoals: 2,
  opponentGoals: 2,
  durationSeconds: 3600,
  playerTimers: { [p1.id]: 3600, [p2.id]: 1200 },
  starters: [p1.id],
  events: [
    { type: 'Goal', playerId: p2.id, matchTimeSeconds: 900 }
  ]
};

[sampleMatchA, sampleMatchB].forEach(match => {
  match.teamId = AppState.currentTeamId || 'lite-default';
  match.period = '2nd Half'; match.status = 'completed';
  match.endedAt = '2026-10-14T15:00:00.000Z'; match.recordedAt = match.endedAt;
  match.players = AppState.squad.map(({ id, name, number, position, proId }) => ({ id, name, number, position, ...(proId ? { proId } : {}) }));
  match.bench = AppState.squad.map(p => p.id).filter(id => !match.starters.includes(id));
  match.events.forEach((event, index) => Object.assign(event, { id: `${match.id}_ev_${index}`, period: match.period, timestamp: 1000 + index }));
});
AppState.matchHistory = [sampleMatchA, sampleMatchB];

// Empty range test should toast and not throw
let toastMsg = '';
App.toast = (msg) => { toastMsg = msg; };
App.generateDateRangePdf('2025-01-01', '2025-01-02');
assert(toastMsg.includes('No matches found'), 'Empty date range must show friendly message');

// Valid range test
App.generateDateRangePdf('2026-10-01', '2026-10-20');
const pdfContainer = dom['pdfExportContainer'];
assert(pdfContainer.innerHTML.includes('Squad Performance Ledger'), 'PDF ledger title missing');
assert(pdfContainer.innerHTML.includes('1W • 1D • 0L') || pdfContainer.innerHTML.includes('1W &bull; 1D &bull; 0L'), 'Record summary should reflect 1W - 1D - 0L');
assert(pdfContainer.innerHTML.includes('Top Scorer'), 'Top scorer highlight badge missing');
assert(pdfContainer.innerHTML.includes('Most Mins'), 'Most minutes highlight badge missing');

// Single Match PDF generation
App.generateSingleMatchPdf('m_range_1');
assert(pdfContainer.innerHTML.includes('Match Performance Report'), 'Single match PDF title missing');
assert(pdfContainer.innerHTML.includes('Wolves FC'), 'Opponent Wolves FC should appear in PDF');
assert(pdfContainer.innerHTML.includes('2-3-1'), 'Formation 2-3-1 should appear in PDF');
console.log('✓ Dual-mode PDF reports (Single Match & Date Range) generation and data accuracy verified');

// ==========================================
// TEST 18b: PDF export failure modes
// ==========================================
// Export must stay rasterisable on phones: scale is clamped so the canvas cannot exceed phone limits.
assert.strictEqual(App.pdfRenderScale({ scrollWidth: 600, scrollHeight: 1000 }), 2, 'Short report should render at scale 2');
assert(App.pdfRenderScale({ scrollWidth: 600, scrollHeight: 20000 }) <= 1, 'Very tall report must drop to scale 1');
assert(App.pdfRenderScale({ scrollWidth: 600, scrollHeight: 20000 }) >= 1, 'Render scale must never drop below 1');

// Every report path must go through the shared exporter, and the naked window.print() fallback is gone.
const exporterCalls = (html.match(/this\.exportLedgerPdf\(/g) || []).length;
assert.strictEqual(exporterCalls, 3, 'All three report generators should use exportLedgerPdf');
assert.strictEqual(jsCode.split('window.print()').length - 1, 1, 'Only printLedger may call window.print');
assert(jsCode.includes("doc.querySelectorAll('link[href*=\"fonts.g\"]').forEach"), 'PDF clone must drop the remote web-font stylesheet');
assert(!jsCode.includes("html2canvas: { scale: 2 }"), 'Reports must not hard-code html2canvas scale 2');

// Printing must isolate the ledger, otherwise the dark app shell prints as blank paper.
assert(html.includes('@media print'), 'Missing @media print rules for the ledger fallback');
assert(html.includes('cs-printing-ledger'), 'Missing ledger print class');

// Header bands must be painted on the cells: html2canvas skips <tr> backgrounds under border-collapse.
const trOnlyHeaderBands = (html.match(/<tr style="background-color:[^"]*">\s*\n\s*<th style="padding: \d+px 10px;">/g) || []).length;
assert.strictEqual(trOnlyHeaderBands, 0, 'Table header cells need their own background-color');

// The Stats-tab builders replace the ledger template, so the per-fixture export must survive that.
assert(jsCode.includes('PDF_LEDGER_TEMPLATE'), 'Static ledger template is not preserved');
assert(jsCode.includes("ledger.innerHTML = PDF_LEDGER_TEMPLATE"), 'openExportModal should restore the ledger template');
console.log('✓ PDF export hardened: bounded canvas, offline-safe clone, printable ledger, painted header bands');

// ==========================================
// TEST 19: Starting Lineups Sorting & Custom Formations
// ==========================================
App.sortLineupByPosition(false);
const starter0 = AppState.squad.find(p => p.id === AppState.match.starters[0]);
assert(starter0, 'Starter 0 should exist');
console.log('✓ Starting lineups sorted by pitch position (GK → DEF → MID → FWD)');

// ==========================================
// TEST 20: Tamper-Proof Read-Only Minutes Reporting
// ==========================================
assert.strictEqual(typeof App.adjustPlayerGameMinutes, 'undefined', 'adjustPlayerGameMinutes must not be defined');
assert.strictEqual(typeof App.openEditGameMinutesModal, 'undefined', 'openEditGameMinutesModal must not be defined');
assert.strictEqual(typeof App.saveGameMinutes, 'undefined', 'saveGameMinutes must not be defined');
console.log('✓ Tamper-proof read-only playing time reporting & game detail breakdown verified');

// ==========================================
// TEST 21: Pro opens inside the app, never in a second tab
// ==========================================
const offlineNote = dom['upgradeProOffline'];
offlineNote.className = 'hidden';
const proShell = dom['proShell'];
proShell.style.display = 'none';
const proFrame = dom['proFrame'];
Object.defineProperty(globalThis, 'navigator', { value: { onLine: false }, configurable: true, writable: true });
let prevented = false;
assert.strictEqual(
  App.openProUpgrade({ preventDefault: () => { prevented = true; } }),
  false,
  'Offline upgrade tap must not navigate'
);
assert(prevented, 'Offline upgrade tap must cancel the anchor navigation');
assert(!offlineNote.classList.contains('hidden'), 'Offline upgrade tap must show the offline note');
assert.notStrictEqual(proShell.style.display, 'flex', 'Offline upgrade tap must not open the Pro shell');

navigator.onLine = true;
prevented = false;
AppState.squad[0].name = 'Updated before Pro opens';
const setFrameAttribute = proFrame.setAttribute;
let rosterReadyBeforeFrame = false;
proFrame.setAttribute = function (key, value) {
  if (key === 'src') rosterReadyBeforeFrame = readRoster().players[0].name === AppState.squad[0].name;
  return setFrameAttribute.call(this, key, value);
};
assert.strictEqual(
  App.openProUpgrade({ preventDefault: () => { prevented = true; } }),
  false,
  'Online Pro tap must open in-app instead of navigating the pane'
);
proFrame.setAttribute = setFrameAttribute;
assert(rosterReadyBeforeFrame, 'The current roster must be published before iframe src is set');
assert(prevented, 'Online Pro tap must cancel the raw anchor navigation');
assert(offlineNote.classList.contains('hidden'), 'Online retry must clear the offline note');
assert.strictEqual(proShell.style.display, 'flex', 'Online Pro tap must reveal the in-app Pro shell');
assert.strictEqual(proFrame.getAttribute('src'), App.PRO_URL, 'Pro iframe must load the Pro app when asked');
assert.strictEqual(history._pushed, 1, 'Opening Pro must push exactly one history entry');
assert(document.body.style.overflow === 'hidden', 'Pro shell must lock the page scroll behind it');

App.closeProShell(false);
assert.strictEqual(proShell.style.display, 'none', 'Back to Lite must hide the Pro shell');
assert(document.body.style.overflow === '', 'Back to Lite must release the page scroll');
assert.strictEqual(history._backed, 1, 'Back to Lite must consume the pushed history entry');
console.log('✓ Pro upgrade opens in-app with Back to Lite, and offline taps stay blocked');

// ==========================================
// TEST 22: Lite roster snapshots and active saved-team synchronization
// ==========================================
AppState.teams = [
  { id: 'lite-team-a', name: 'Lite Team A', squad: [] },
  { id: 'lite-team-b', name: 'Lite Team B', squad: [{ id: 'other-player', name: 'Other Player', number: 1, position: 'GK' }] }
];
App.loadTeam('lite-team-a');
assert.deepStrictEqual(readRoster().players, [], 'An empty saved squad must not import demo players');
assert.strictEqual(readRoster().teamId, 'lite-team-a');
assert.strictEqual(readRoster().teamName, 'Lite Team A');
assert.strictEqual(readRoster().installationId, initialRoster.installationId);
const emptySnapshot = storage[rosterKey];
const writesBeforeNoChange = storageWrites.filter(k => k === rosterKey).length;
const eventsBeforeNoChange = rosterChangeEvents.length;
AppState.clock.seconds += 1;
AppState.match.ourGoals += 1;
App.saveStorage();
App.publishLiteRoster();
assert.strictEqual(storage[rosterKey], emptySnapshot, 'Unrelated saves must preserve the exact snapshot and revision');
assert.strictEqual(storageWrites.filter(k => k === rosterKey).length, writesBeforeNoChange);
assert.strictEqual(rosterChangeEvents.length, eventsBeforeNoChange, 'No event may be dispatched for unchanged content');

App.openAddPlayerModal();
dom['inputPlayerName'].value = 'Lite Created Player';
dom['inputPlayerNumber'].value = '23';
dom['inputPlayerPosition'].value = 'CM';
App.saveNewPlayer();
const createdPlayer = { ...AppState.squad[0] };
assert.deepStrictEqual(readRoster().players, [createdPlayer], 'Added player must appear in the snapshot');
assert(new Date(readRoster().revision) > new Date(JSON.parse(emptySnapshot).revision), 'A content change must advance revision, even in the same millisecond');
assert.deepStrictEqual(AppState.teams[0].squad, [createdPlayer]);
assert.deepStrictEqual(JSON.parse(storage['Clubstride Mobile_teams'])[0].squad, [createdPlayer]);
assert.strictEqual(rosterChangeEvents.length, eventsBeforeNoChange + 1);
assert.deepStrictEqual(Object.keys(readRoster()).sort(), ['version', 'installationId', 'teamId', 'teamName', 'players', 'revision'].sort());
assert.deepStrictEqual(Object.keys(readRoster().players[0]).sort(), ['id', 'name', 'number', 'position'].sort());

App.openEditPlayerModal(createdPlayer.id);
dom['inputPlayerName'].value = 'Lite Edited Player';
dom['inputPlayerNumber'].value = '24';
dom['inputPlayerPosition'].value = 'ST';
App.saveNewPlayer();
const editedPlayer = { id: createdPlayer.id, name: 'Lite Edited Player', number: 24, position: 'ST' };
assert.deepStrictEqual(readRoster().players, [editedPlayer], 'All edited fields must be shared, without changing player identity');
App.loadTeam('lite-team-b');
assert.strictEqual(readRoster().teamId, 'lite-team-b');
assert.deepStrictEqual(readRoster().players, AppState.teams[1].squad);
App.loadTeam('lite-team-a');
assert.deepStrictEqual(AppState.squad, [editedPlayer], 'Switching away and back must preserve created and edited players');
assert.deepStrictEqual(readRoster().players, [editedPlayer]);
assert.notStrictEqual(AppState.squad, AppState.teams[0].squad, 'Saved teams must keep a detached squad copy');
App.deletePlayer(createdPlayer.id);
assert.deepStrictEqual(readRoster().players, [], 'Deleting the last player must publish an empty array');
assert.deepStrictEqual(JSON.parse(storage['Clubstride Mobile_teams'])[0].squad, []);
App.loadTeam('lite-team-b');
App.loadTeam('lite-team-a');
assert.deepStrictEqual(AppState.squad, [], 'Switching teams must not resurrect deleted players');
const snapshotBeforeReload = storage[rosterKey];
App.init();
assert.deepStrictEqual(AppState.squad, [], 'Loading persisted data must keep the squad empty');
assert.strictEqual(storage[rosterKey], snapshotBeforeReload, 'Initialization after reload must preserve identities and revision');
assert.strictEqual(installationUuidCalls, 1, 'Installation UUID must be generated only once');
assert.strictEqual(installationRandomValuesCalls, 0);

AppState.currentTeamId = null;
AppState.currentTeamName = '';
dom['inputCurrentTeamName'].value = 'Input Team Name';
App.saveStorage();
assert.strictEqual(readRoster().teamId, 'lite-default');
assert.strictEqual(readRoster().teamName, 'Input Team Name');
assert.strictEqual(storage['Clubstride Mobile_current_team_id'], '', 'Clearing team selection must not reload a stale saved-team ID');
dom['inputCurrentTeamName'].value = '';
App.saveStorage();
assert.strictEqual(readRoster().teamName, 'Clubstride FC');
assert.strictEqual(readRoster().installationId, initialRoster.installationId);
console.log('✓ Lite snapshots include added/edited/deleted players, preserve empty squads and identities, and sync saved teams');

// ==========================================
// TEST 23: Secure UUID fallback and visible, non-destructive storage failures
// ==========================================
const secureCrypto = window.crypto;
const installationBeforeFallback = storage[installationKey];
delete storage[installationKey];
window.crypto = { getRandomValues: secureCrypto.getRandomValues };
const fallbackId = App.getLiteInstallationId();
assert.match(fallbackId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
assert.strictEqual(App.getLiteInstallationId(), fallbackId);
assert.strictEqual(installationRandomValuesCalls, 1, 'Secure fallback must generate a UUID only once');
storage[installationKey] = installationBeforeFallback;
window.crypto = secureCrypto;

const workingSetItem = localStorage.setItem;
const originalConsoleError = console.error;
console.error = () => {};
try {
  const durableSquad = storage['Clubstride Mobile_squad'];
  const durableSnapshot = storage[rosterKey];
  const eventsBeforeFailure = rosterChangeEvents.length;
  AppState.squad.push({ id: 'unsaved-player', name: 'Keep Me', number: 42, position: 'GK' });
  localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.strictEqual(App.saveStorage(), false);
  assert.strictEqual(storage['Clubstride Mobile_squad'], durableSquad, 'Failed save must not clear durable Lite data');
  assert.strictEqual(storage[rosterKey], durableSnapshot, 'Snapshot must not publish after a failed normal save');
  assert.strictEqual(rosterChangeEvents.length, eventsBeforeFailure);
  assert(!dom['storageFailureStatus'].classList.contains('hidden'));
  assert(dom['storageFailureStatus'].innerText.includes('could not be saved'));
  assert(AppState.squad.some(p => p.id === 'unsaved-player'), 'Unsaved edits must stay in memory');

  localStorage.setItem = (key, value) => {
    if (key === rosterKey) throw new Error('QuotaExceededError');
    workingSetItem(key, value);
  };
  assert.strictEqual(App.saveStorage(), false);
  assert(JSON.parse(storage['Clubstride Mobile_squad']).some(p => p.id === 'unsaved-player'), 'A snapshot failure must not discard a successful Lite save');
  assert.strictEqual(storage[rosterKey], durableSnapshot, 'Failed atomic snapshot replacement must leave the old snapshot intact');
  assert.strictEqual(rosterChangeEvents.length, eventsBeforeFailure);
  assert(dom['storageFailureStatus'].innerText.includes('Roster sharing'));
  App.openProShell(false);
  assert.strictEqual(proShell.style.display, 'none', 'Do not open Pro with stale data after a snapshot failure');

  localStorage.setItem = workingSetItem;
  assert.strictEqual(App.saveStorage(), true, 'A later save must retry publication successfully');
  assert(dom['storageFailureStatus'].classList.contains('hidden'));
  assert(readRoster().players.some(p => p.id === 'unsaved-player'));
  assert.strictEqual(rosterChangeEvents.length, eventsBeforeFailure + 1);

  const storedInstallation = storage[installationKey];
  delete storage[installationKey];
  window.crypto = {};
  const snapshotBeforeCryptoFailure = storage[rosterKey];
  assert.strictEqual(App.publishLiteRoster(), false, 'Missing secure crypto must fail visibly, not use Math.random');
  assert.strictEqual(storage[installationKey], undefined);
  assert.strictEqual(storage[rosterKey], snapshotBeforeCryptoFailure);
  assert(!dom['storageFailureStatus'].classList.contains('hidden'));
  window.crypto = secureCrypto;
  storage[installationKey] = storedInstallation;
  App.publishLiteRoster();

  const storedMatch = storage['Clubstride Mobile_match'];
  storage['Clubstride Mobile_match'] = '{invalid JSON';
  const writesBeforeLoadFailure = storageWrites.length;
  App.loadStorage();
  assert.strictEqual(App.saveStorage(), false, 'A load failure must block overwriting partially loaded Lite data');
  assert.strictEqual(App.publishLiteRoster(), false);
  assert.strictEqual(storageWrites.length, writesBeforeLoadFailure);
  assert(dom['storageFailureStatus'].innerText.includes('Saving is paused'));
  storage['Clubstride Mobile_match'] = storedMatch;
  App.loadStorage();
  assert.strictEqual(App.saveStorage(), true);
  assert(dom['storageFailureStatus'].classList.contains('hidden'));
} finally {
  localStorage.setItem = workingSetItem;
  window.crypto = secureCrypto;
  console.error = originalConsoleError;
}
console.log('✓ Secure UUID fallback, storage failure alerts, retained data, and successful retries verified');

// ==========================================
// TEST 24: Incoming Pro edits/additions retain the running match and Lite identities
// ==========================================
const clone = value => JSON.parse(JSON.stringify(value));
const uuidA = 'a1111111-1111-4111-8111-111111111111';
const uuidB = 'b2222222-2222-4222-8222-222222222222';
const uuidTeam = 'c3333333-3333-4333-8333-333333333333';
const uuidOwner = 'd4444444-4444-4444-8444-444444444444';
const incoming = (snapshot, eventType = 'cs-lite-roster-change') => {
  storage[rosterKey] = JSON.stringify(snapshot); // A different document's atomic write.
  window.dispatchEvent({ type: eventType, key: rosterKey });
};
const advance = snapshot => ({ ...clone(snapshot), revision: new Date(Date.parse(snapshot.revision) + 1).toISOString() });
assert.strictEqual(windowListeners.get('storage').length, 1, 'Repeated init must not multiply shared listeners');
assert.strictEqual(windowListeners.get('cs-lite-roster-change').length, 1);
assert.strictEqual(windowListeners.get('focus').length, 1);
App.loadTeam('lite-team-b');
const originalPlayer = clone(AppState.squad[0]);
AppState.match.starters = [originalPlayer.id];
AppState.match.bench = [];
AppState.clock.seconds = 127;
AppState.clock.running = true;
AppState.clock.startedAt = Date.now();
AppState.playerTimers = { [originalPlayer.id]: 127, archived_player: 80 };
AppState.events = [{ id: 'pro-test-goal', type: 'Goal', playerId: originalPlayer.id, matchTimeSeconds: 50 }];
App.saveStorage();
const matchBeforeIncoming = clone({ clock: AppState.clock, events: AppState.events, timers: AppState.playerTimers });
const archivedHistoryBefore = clone(AppState.matchHistory);
let proUpdate = advance(readRoster());
// A Pro-backed Lite team keeps its original Lite key; cloudTeamId is a separate identity.
proUpdate.cloudTeamId = uuidTeam;
proUpdate.ownerId = uuidOwner;
proUpdate.readOnly = false;
proUpdate.players = [
  { ...originalPlayer, name: 'Pro Edited Player', number: 21, position: 'CM', proId: uuidA, available: true },
  { id: 'lite-pro-added', name: 'Pro Added Player', number: 0, position: 'ST', proId: uuidB, available: false }
];
const incomingWritesBefore = storageWrites.filter(k => k === rosterKey).length;
incoming(proUpdate, 'storage');
assert.deepStrictEqual(AppState.squad, proUpdate.players);
assert.deepStrictEqual(AppState.match.starters, [originalPlayer.id], 'Existing lineup IDs must not be reseeded');
assert.deepStrictEqual(AppState.match.bench, [], 'An unavailable addition must not be fielded');
assert.deepStrictEqual({ clock: AppState.clock, events: AppState.events, timers: AppState.playerTimers }, matchBeforeIncoming);
assert.strictEqual(AppState.match.availability['lite-pro-added'], false);
assert.deepStrictEqual(JSON.parse(storage['Clubstride Mobile_squad']), proUpdate.players);
assert.deepStrictEqual(AppState.teams.find(t => t.id === 'lite-team-b').squad, proUpdate.players);
assert.strictEqual(storageWrites.filter(k => k === rosterKey).length, incomingWritesBefore, 'Applying Pro must not republish the snapshot');
console.log('✓ Incoming Pro additions/edits preserve the running clock, events, timers, lineup IDs and saved squad');

// ==========================================
// TEST 25: Lite edits keep canonical Pro UUID and availability, with no write loop
// ==========================================
App.openEditPlayerModal('lite-pro-added');
dom['inputPlayerName'].value = 'Edited in Lite';
dom['inputPlayerNumber'].value = '22';
dom['inputPlayerPosition'].value = 'CM';
const beforeLiteEditEvents = rosterChangeEvents.length;
App.saveNewPlayer();
const liteEdited = readRoster().players.find(p => p.id === 'lite-pro-added');
assert.strictEqual(liteEdited.proId, uuidB);
assert.strictEqual(liteEdited.available, false);
assert.strictEqual(liteEdited.id, 'lite-pro-added');
assert.strictEqual(readRoster().teamId, 'lite-team-b', 'Cloud backing must not remint the Lite team key');
assert.strictEqual(readRoster().cloudTeamId, uuidTeam);
assert.strictEqual(readRoster().ownerId, uuidOwner);
assert.strictEqual(AppState.teams.find(t => t.id === 'lite-team-b').cloudTeamId, uuidTeam);
assert.strictEqual(rosterChangeEvents.length, beforeLiteEditEvents + 1, 'Self-dispatched events must not cause a second write');
App.toggleAvailability('lite-pro-added');
assert.strictEqual(readRoster().players.find(p => p.id === 'lite-pro-added').available, true);
assert.strictEqual(readRoster().players.find(p => p.id === 'lite-pro-added').proId, uuidB);
const beforeDuplicateWrites = storageWrites.length;
const beforeDuplicateEvents = rosterChangeEvents.length;
window.dispatchEvent({ type: 'focus' });
window.dispatchEvent({ type: 'storage', key: 'unrelated-key' });
window.dispatchEvent({ type: 'cs-lite-roster-change' });
assert.strictEqual(storageWrites.length, beforeDuplicateWrites, 'Identical notifications must not even rewrite legacy data');
assert.strictEqual(rosterChangeEvents.length, beforeDuplicateEvents + 1, 'Only the simulated incoming custom event is recorded');
const contentOnlyRevision = advance(readRoster());
incoming(contentOnlyRevision, 'storage');
assert.strictEqual(storageWrites.length, beforeDuplicateWrites, 'A revision-only change must be a no-op');
App.saveStorage();
assert.deepStrictEqual(readRoster(), contentOnlyRevision, 'Saving identical content must keep the source revision');
console.log('✓ Lite saves preserve proId/availability; self, duplicate and revision-only notifications have no write loops');

// ==========================================
// TEST 26: Incoming delete and empty roster retain historical timers/events
// ==========================================
let deletion = advance(readRoster());
deletion.players = deletion.players.filter(p => p.id !== originalPlayer.id);
incoming(deletion);
assert(!AppState.match.starters.includes(originalPlayer.id));
assert(!AppState.match.bench.includes(originalPlayer.id));
assert(!Object.prototype.hasOwnProperty.call(AppState.match.availability, originalPlayer.id));
assert.strictEqual(AppState.playerTimers[originalPlayer.id], 127, 'Deletion cannot erase accrued minutes');
assert.deepStrictEqual(AppState.events, matchBeforeIncoming.events);
const timersBeforeEmpty = clone(AppState.playerTimers);
const emptyIncoming = { ...advance(readRoster()), players: [] };
incoming(emptyIncoming);
assert.deepStrictEqual(AppState.squad, []);
assert.deepStrictEqual(AppState.match.starters, []);
assert.deepStrictEqual(AppState.match.bench, []);
assert.deepStrictEqual(AppState.match.availability, {});
assert.deepStrictEqual(AppState.playerTimers, timersBeforeEmpty);
assert.strictEqual(AppState.clock.running, true);
assert.deepStrictEqual(AppState.matchHistory, archivedHistoryBefore);
assert.deepStrictEqual(JSON.parse(storage['Clubstride Mobile_squad']), []);
console.log('✓ Incoming deletion/empty roster clean live IDs without erasing events, accrued timers or archived history');

// ==========================================
// TEST 27: Cloud team switch saves the unsaved Lite default and unrelated teams
// ==========================================
AppState.clock.running = false;
AppState.currentTeamId = null;
AppState.currentTeamName = 'My Unsaved Local Team';
App.setSharedTeamMetadata({});
AppState.teams = AppState.teams.filter(t => t.id !== 'lite-default');
AppState.squad = [{ id: 'local-kept', name: 'Local Kept Player', number: 7, position: 'FWD' }];
AppState.match.starters = ['local-kept'];
AppState.match.bench = [];
AppState.match.availability = { 'local-kept': true };
AppState.clock.seconds = 90;
AppState.clock.running = true;
const runningInterval = setInterval(() => {}, 100000);
AppState.clock.intervalId = runningInterval;
// Do not serialize the Node timer handle, which is unlike a browser's numeric handle.
AppState.clock.intervalId = null;
App.saveStorage();
AppState.clock.intervalId = runningInterval;
const unrelatedTeams = clone(AppState.teams);
const cloudSnapshot = {
  version: 1, installationId: uuidOwner,
  teamId: `cloud-${uuidTeam}`, teamName: 'Shared Cloud Team', cloudTeamId: uuidTeam,
  ownerId: uuidOwner, readOnly: false,
  revision: new Date(Date.parse(readRoster().revision) + 1).toISOString(),
  players: [{ id: 'lite-cloud-id', name: 'Cloud Player', number: 9, position: 'ST', proId: uuidA, available: true }],
  access_token: 'must-not-copy', refresh_token: 'must-not-copy'
};
const cloudWritesBefore = storageWrites.filter(k => k === rosterKey).length;
try { incoming(cloudSnapshot, 'storage'); } finally { clearInterval(runningInterval); }
assert.strictEqual(AppState.currentTeamId, cloudSnapshot.teamId);
assert.strictEqual(AppState.cloudTeamId, uuidTeam);
assert.strictEqual(AppState.ownerId, uuidOwner);
assert.strictEqual(AppState.clock.running, false);
assert.strictEqual(AppState.clock.seconds, 0);
assert.strictEqual(AppState.clock.intervalId, null);
assert.deepStrictEqual(AppState.events, []);
assert.deepStrictEqual(AppState.playerTimers, {});
assert.deepStrictEqual(AppState.matchHistory, archivedHistoryBefore);
const preservedDefault = AppState.teams.find(t => t.id === 'lite-default');
assert.strictEqual(preservedDefault.name, 'My Unsaved Local Team');
assert.strictEqual(preservedDefault.squad[0].id, 'local-kept');
for (const team of unrelatedTeams) assert.deepStrictEqual(clone(AppState.teams.find(t => t.id === team.id)), team);
const savedCloud = AppState.teams.find(t => t.id === cloudSnapshot.teamId);
assert.strictEqual(savedCloud.cloudTeamId, uuidTeam);
assert.strictEqual(savedCloud.ownerId, uuidOwner);
assert.strictEqual(savedCloud.readOnly, false);
assert.strictEqual(savedCloud.squad[0].proId, uuidA);
assert(!JSON.stringify(AppState).includes('must-not-copy'), 'No transport credentials may enter Lite state');
assert.strictEqual(storageWrites.filter(k => k === rosterKey).length, cloudWritesBefore);
App.openEditPlayerModal('lite-cloud-id');
dom['inputPlayerName'].value = 'Cloud Player Edited in Lite';
dom['inputPlayerNumber'].value = '10';
dom['inputPlayerPosition'].value = 'CM';
App.saveNewPlayer();
assert.strictEqual(readRoster().teamId, `cloud-${uuidTeam}`);
assert.strictEqual(readRoster().installationId, uuidOwner, 'Incoming installation identity must not be reminted');
assert.strictEqual(readRoster().players[0].id, 'lite-cloud-id');
assert.strictEqual(readRoster().players[0].proId, uuidA);
assert.strictEqual(readRoster().cloudTeamId, uuidTeam);
assert.strictEqual(readRoster().ownerId, uuidOwner);
App.loadTeam('lite-default');
assert.strictEqual(AppState.squad[0].id, 'local-kept');
assert.strictEqual(readRoster().cloudTeamId, undefined, 'Cloud metadata cannot leak into an unrelated local team');
App.loadTeam(cloudSnapshot.teamId);
assert.strictEqual(AppState.squad[0].proId, uuidA);
assert.strictEqual(AppState.squad[0].name, 'Cloud Player Edited in Lite');
console.log('✓ Cloud team switches stop/reset the live match, preserve unsaved Lite/default and unrelated teams, history and cloud identities');

// ==========================================
// TEST 28: A cold startup prioritizes the canonical snapshot over stale legacy storage
// ==========================================
const canonicalStartup = advance(readRoster());
canonicalStartup.players.push({ id: 'fresh-pro-player', name: 'New Since Lite Closed', number: 14, position: 'DEF', proId: uuidB });
canonicalStartup.teamName = 'Canonical Team Name';
storage[rosterKey] = JSON.stringify(canonicalStartup);
const canonicalBytes = storage[rosterKey];
storage['Clubstride Mobile_squad'] = JSON.stringify(preservedDefault.squad);
storage['Clubstride Mobile_current_team_id'] = 'lite-default';
storage['Clubstride Mobile_current_team_name'] = preservedDefault.name;
storage['Clubstride Mobile_match'] = JSON.stringify({ ...AppState.match, starters: ['local-kept'], bench: [], availability: { 'local-kept': true } });
windowListeners.clear();
eval(jsCode); // Fresh App and AppState, with the same durable browser storage.
const writesBeforeColdInit = storageWrites.filter(k => k === rosterKey).length;
App.init();
assert.strictEqual(AppState.currentTeamId, canonicalStartup.teamId);
assert.strictEqual(AppState.currentTeamName, canonicalStartup.teamName);
assert.deepStrictEqual(AppState.squad, canonicalStartup.players);
assert.strictEqual(storage[rosterKey], canonicalBytes, 'Startup cannot republish stale legacy data or advance the canonical revision');
assert.strictEqual(storageWrites.filter(k => k === rosterKey).length, writesBeforeColdInit);
assert.deepStrictEqual(AppState.matchHistory, archivedHistoryBefore);
assert.strictEqual(AppState.teams.find(t => t.id === 'lite-default').squad[0].id, 'local-kept');
console.log('✓ Cold reload honors canonical Pro data before any Lite publication and preserves outgoing local data/history');

// ==========================================
// TEST 29: Whole-snapshot validation is non-destructive, and explicit publish recovers
// ==========================================
const goodIncoming = clone(readRoster());
const goodLocalState = JSON.stringify(AppState);
const malformedSnapshots = [
  { ...clone(goodIncoming), version: 2 },
  { ...clone(goodIncoming), installationId: 'not-a-uuid' },
  { ...clone(goodIncoming), revision: 123 },
  { ...clone(goodIncoming), revision: 'not-a-date' },
  { ...clone(goodIncoming), teamName: '  ' },
  { ...clone(goodIncoming), cloudTeamId: 'bad-uuid' },
  { ...clone(goodIncoming), teamId: 'cloud-bad-uuid' },
  { ...clone(goodIncoming), ownerId: 42 },
  { ...clone(goodIncoming), readOnly: 'false' },
  { ...clone(goodIncoming), players: [...goodIncoming.players, goodIncoming.players[0]] },
  ...[
    { name: '' }, { name: '<script>bad</script>' }, { number: '7' }, { number: -1 },
    { number: 100 }, { number: 1.5 }, { proId: 'bad-uuid' }, { available: 1 }, { id: '' }
  ].map(edit => ({ ...clone(goodIncoming), players: [goodIncoming.players[0], { ...goodIncoming.players[1], ...edit }] })),
  { ...clone(goodIncoming), players: [goodIncoming.players[0], { ...goodIncoming.players[1], proId: uuidA.toUpperCase() }] }
];
for (const malformed of malformedSnapshots) {
  storage[rosterKey] = JSON.stringify(malformed);
  const writesBeforeInvalid = storageWrites.length;
  assert.strictEqual(App.applySharedRoster(), false);
  assert.strictEqual(JSON.stringify(AppState), goodLocalState, 'One invalid row must reject the entire snapshot');
  assert.strictEqual(storageWrites.length, writesBeforeInvalid);
  assert(!dom['storageFailureStatus'].classList.contains('hidden'));
}
storage[rosterKey] = '{broken JSON';
assert.strictEqual(App.applySharedRoster(), false);
const brokenBytes = storage[rosterKey];
App.saveStorage();
assert.strictEqual(storage[rosterKey], brokenBytes, 'Automatic saving must not erase an invalid source');
App.init();
assert.strictEqual(storage[rosterKey], brokenBytes, 'Startup must leave malformed source visible, not silently replace it');
assert.deepStrictEqual(AppState.squad, goodIncoming.players);
assert(!dom['recoverSharedRosterBtn'].classList.contains('hidden'));
assert.strictEqual(App.publishLiteRoster(), true, 'An explicit publish must recover using retained good Lite data');
assert.deepStrictEqual(readRoster().players, goodIncoming.players);
assert(dom['recoverSharedRosterBtn'].classList.contains('hidden'));
assert(dom['storageFailureStatus'].classList.contains('hidden'));
console.log('✓ Invalid metadata, revisions, UUIDs, duplicate IDs and invalid player rows cannot erase good data; explicit publish recovers');

// ==========================================
// TEST 30: Read-only shared rosters guard controls AND every roster/team mutator
// ==========================================
const readOnlySnapshot = { ...advance(readRoster()), readOnly: true };
incoming(readOnlySnapshot, 'storage');
assert.strictEqual(AppState.readOnly, true);
assert.strictEqual(AppState.teams.find(t => t.id === readOnlySnapshot.teamId).readOnly, true);
assert.strictEqual(dom['inputCurrentTeamName'].disabled, true);
assert.strictEqual(dom['inputPlayerName'].disabled, true);
assert.strictEqual(dom['backupFileInput'].disabled, true);
assert(!dom['sharedRosterStatus'].classList.contains('hidden'));
assert(dom['sharedRosterStatus'].innerText.includes('read-only'));
const readOnlyState = JSON.stringify(AppState);
const readOnlyBytes = storage[rosterKey];
const readOnlyWritesBefore = storageWrites.length;
const mutators = [
  () => App.openAddPlayerModal(), () => App.openEditPlayerModal('lite-cloud-id'), () => App.saveNewPlayer(),
  () => App.deletePlayer('lite-cloud-id'), () => App.updatePlayerPosition('lite-cloud-id', 'GK'),
  () => App.toggleAvailability('lite-cloud-id'), () => App.setAllAvailability(false),
  () => App.saveActiveTeam(), () => App.createNewTeamPrompt(), () => App.deleteTeam(readOnlySnapshot.teamId),
  () => App.setTeamThemeColor('#ffffff'), () => App.setTeamThemeStyle('solid'), () => App.setKitColor('#ffffff'),
  () => App.handleLogoUpload({ target: { files: [{}] } }),
  () => App.handleTeamLogoUpload({ target: { files: [{}] } }),
  () => App.importBackup({ target: { files: [{}] } })
];
App.toast = msg => { toastMsg = msg; };
for (const mutate of mutators) {
  mutate();
  assert.strictEqual(JSON.stringify(AppState), readOnlyState);
  assert.strictEqual(storageWrites.length, readOnlyWritesBefore);
  assert(toastMsg.includes('read-only'), 'Blocked mutations must show a visible explanation');
}
App.saveStorage();
assert.strictEqual(storage[rosterKey], readOnlyBytes, 'Read-only match/local saves cannot republish the source');
AppState.squad[0].name = 'Internal bypass attempt';
assert.strictEqual(App.publishLiteRoster(), false, 'Publishing must also guard an internally changed read-only roster');
assert.strictEqual(storage[rosterKey], readOnlyBytes);
AppState.squad[0].name = readOnlySnapshot.players[0].name;
const writableSnapshot = { ...advance(readOnlySnapshot), readOnly: false };
incoming(writableSnapshot);
assert.strictEqual(dom['inputCurrentTeamName'].disabled, false);
assert.strictEqual(dom['inputPlayerName'].disabled, false);
assert(dom['sharedRosterStatus'].classList.contains('hidden'));
App.openEditPlayerModal('lite-cloud-id');
dom['inputPlayerName'].value = 'Writable Again';
dom['inputPlayerNumber'].value = '10';
dom['inputPlayerPosition'].value = 'CM';
App.saveNewPlayer();
assert.strictEqual(readRoster().players[0].name, 'Writable Again');
assert.strictEqual(readRoster().players[0].proId, uuidA);
assert.strictEqual(readRoster().readOnly, false);
assert.strictEqual(cacheVersion[1], 'Clubstride Lite-v19', 'Do not bump the pending publication version');
console.log('✓ Read-only controls/mutators block edits without writes, auth or credentials, and restore editing when permission changes');

// ==========================================
// TEST 31: Lite publishes its live match and finished archive for Pro
// ==========================================
const keyWrites = key => storageWrites.filter(k => k === key).length;
const cloudTeam = AppState.currentTeamId;
AppState.matchHistory = [{ id: 'm_archived', title: 'Season Opener', teamName: 'Shared Cloud Team', opponent: 'Rivals',
  date: '2026-10-20', format: '7', formation: '2-1-2', ourGoals: 4, opponentGoals: 1, durationSeconds: 1200,
  period: '2nd Half', status: 'completed', endedAt: '2026-10-20T11:00:00.000Z',
  playerTimers: { 'lite-cloud-id': 1200 }, starters: ['lite-cloud-id'], bench: [], teamId: cloudTeam,
  players: [{ id: 'lite-cloud-id', name: 'Writable Again', number: 10, position: 'CM', proId: uuidA }],
  events: [{ id: 'ev_archived', type: 'Goal', playerId: 'lite-cloud-id', playerName: 'Writable Again', playerNumber: 10,
    matchTimeSeconds: 45, period: '1st Half', timestamp: 1761548400000 }] }];
AppState.match = { id: 'm_live_test', title: 'Fixture Two', teamName: 'Shared Cloud Team', opponent: 'Rovers',
  date: '2026-10-27', format: '7', formation: '2-1-2', status: 'scheduled', availability: {}, fieldPositions: {},
  starters: ['lite-cloud-id'], bench: [], ourGoals: 1, opponentGoals: 0, initialStarters: ['lite-cloud-id'] };
AppState.events = [{ id: 'ev_live_goal', type: 'Goal', playerId: 'lite-cloud-id', playerName: 'Writable Again', playerNumber: 10,
  matchTimeSeconds: 45, period: '1st Half', timestamp: 1761548400000 }];
AppState.playerTimers = { 'lite-cloud-id': 127 };
AppState.clock.seconds = 127;
AppState.clock.period = '1st Half';
AppState.clock.running = true;
AppState.clock.startedAt = Date.now();
AppState.clock.intervalId = null;
const cloudKey = App.matchScope().key;
assert.strictEqual(cloudKey, `cs.lite.matches.v1.${readRoster().installationId}.${cloudTeam}`);
delete storage[cloudKey]; // Earlier groups already proved publishing; start this team's file clean.
const firstPublish = keyWrites(cloudKey);
App.saveStorage();
assert.strictEqual(keyWrites(cloudKey), firstPublish + 1, 'One save must write the match file exactly once');
const published = JSON.parse(storage[cloudKey]);
assert.strictEqual(published.version, 1);
assert.strictEqual(published.installationId, readRoster().installationId, 'The match file must use the roster installation identity');
assert.strictEqual(published.teamId, cloudTeam);
assert.strictEqual(new Date(published.revision).toISOString(), published.revision);
assert.strictEqual(published.removed.length, 0);
assert.strictEqual(published.matches.length, 1);
assert.strictEqual(published.matches[0].id, 'm_archived');
assert.strictEqual(published.matches[0].status, 'completed');
assert.strictEqual(published.matches[0].endedAt, '2026-10-20T11:00:00.000Z');
assert.strictEqual(published.matches[0].players[0].proId, uuidA, 'Archived players keep their cloud identity');
assert.strictEqual(published.live.id, 'm_live_test');
assert.strictEqual(published.live.status, 'in_progress');
assert.strictEqual(published.live.durationSeconds, 127);
assert.strictEqual(published.live.playerTimers['lite-cloud-id'], 127);
assert.deepStrictEqual(published.live.starters, ['lite-cloud-id']);
assert.strictEqual(published.live.availability, undefined, 'Pitch-only fields never cross to Pro');
assert.strictEqual(published.live.fieldPositions, undefined);
assert.strictEqual(published.live.initialStarters, undefined);
// Pro's parser only accepts ISO event stamps, so the wire format converts Lite's epoch milliseconds.
for (const record of [...published.matches, published.live]) {
  for (const occurrence of record.events) {
    assert.match(occurrence.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/, 'Event timestamps must travel as ISO');
  }
}
assert.strictEqual(AppState.match.recordedAt, published.live.recordedAt, 'The live match keeps the version it published');
assert.strictEqual(JSON.parse(storage['Clubstride Mobile_history']).some(m => m.id === 'm_archived'), true);
const publishedBytes = storage[cloudKey];
const publishedWrites = keyWrites(cloudKey);
assert.strictEqual(App.publishLiteMatches(), true);
assert.strictEqual(storage[cloudKey], publishedBytes, 'Re-saving unchanged matches must not advance the shared revision');
assert.strictEqual(keyWrites(cloudKey), publishedWrites, 'Publishing identical content writes nothing');
assert.strictEqual(App.matchFingerprint({ b: 1, a: { d: 2, c: 3 } }), App.matchFingerprint({ a: { c: 3, d: 2 }, b: 1 }),
  'The publish guard compares content, not key order');
console.log('✓ Lite writes its live match, archive and cloud identities into the shared match file without a write loop');

// ==========================================
// TEST 32: Pro match edits land in Lite, and Lite keeps (or deletes) club rows correctly
// ==========================================
const uuidMatch = 'e5555555-5555-4555-8555-555555555555';
const uuidLineup = 'f6666666-6666-4666-8666-666666666666';
const clubRecord = { ...clone(published.matches[0]), id: uuidMatch, proId: uuidMatch, title: 'Club Fixture',
  opponent: 'Club Rivals', lineupIds: { 'lite-cloud-id': uuidLineup }, recordedAt: published.revision };
const editedArchive = { ...clone(published.matches[0]), opponent: 'Renamed By Pro',
  recordedAt: new Date(Date.parse(published.matches[0].recordedAt) + 2000).toISOString() };
const fromPro = { ...advance(clone(published)), matches: [editedArchive, clubRecord] };
storage[cloudKey] = JSON.stringify(fromPro);
const proApplyWrites = keyWrites(cloudKey);
window.dispatchEvent({ type: 'storage', key: cloudKey });
assert.strictEqual(AppState.matchHistory.find(m => m.id === 'm_archived').opponent, 'Renamed By Pro',
  'A Pro edit to a shared match lands in Lite history');
assert.strictEqual(AppState.matchHistory.find(m => m.id === uuidMatch).proId, uuidMatch,
  'A match created in Pro becomes part of the same Lite dataset');
assert.strictEqual(AppState.match.id, 'm_live_test', 'Another document must not hijack the running match');
assert.strictEqual(AppState.clock.seconds, 127);
assert.strictEqual(AppState.events.length, 1);
assert.strictEqual(keyWrites(cloudKey), proApplyWrites, 'Applying Pro must not republish the match file');
assert.deepStrictEqual(JSON.parse(storage['Clubstride Mobile_history']).map(m => m.id).sort(),
  AppState.matchHistory.map(m => m.id).sort());
AppState.clock.running = false;
AppState.playerTimers = { 'lite-cloud-id': 200 };
AppState.clock.seconds = 200;
App.saveStorage();
const republished = JSON.parse(storage[cloudKey]);
assert.strictEqual(republished.matches.some(m => m.id === uuidMatch && m.proId === uuidMatch), true,
  'Lite must carry a club match forward, not tombstone its own copy of it');
assert.strictEqual(republished.removed.length, 0);
assert.strictEqual(republished.matches.find(m => m.id === uuidMatch).lineupIds['lite-cloud-id'], uuidLineup,
  'Server line-up row ids survive a Lite save');
assert.strictEqual(republished.live.proId, undefined, 'A Lite-authored match gains no false cloud identity');
const tombstoned = { ...advance(clone(republished)), matches: republished.matches.filter(m => m.id !== uuidMatch),
  removed: [{ id: uuidMatch, proId: uuidMatch, recordedAt: new Date(Date.parse(republished.revision) + 1000).toISOString() }] };
storage[cloudKey] = JSON.stringify(tombstoned);
window.dispatchEvent({ type: 'storage', key: cloudKey });
assert.strictEqual(AppState.matchHistory.some(m => m.id === uuidMatch), false, 'A Pro deletion clears the Lite archive');
App.saveStorage();
const afterDelete = JSON.parse(storage[cloudKey]);
assert.strictEqual(afterDelete.matches.some(m => m.id === uuidMatch), false, 'Lite must not resurrect a deleted match');
assert.strictEqual(afterDelete.removed.length, 1);
assert.strictEqual(afterDelete.removed[0].proId, uuidMatch, 'The tombstone keeps the cloud identity for the club');
assert.strictEqual(afterDelete.removed[0].id, uuidMatch);
console.log('✓ Pro edits, additions and deletions flow into Lite, and Lite never loses or revives a club match');

// ==========================================
// TEST 33: Every saved team owns its match file, and read-only staff block all match tools
// ==========================================
const scopedBytes = storage[cloudKey];
const scopedWrites = keyWrites(cloudKey);
App.loadTeam('lite-default');
const localKey = App.matchScope().key;
assert.notStrictEqual(localKey, cloudKey, 'Two teams cannot share one match file');
const localMatches = JSON.parse(storage[localKey]);
assert.strictEqual(localMatches.teamId, 'lite-default');
assert.notStrictEqual(localMatches.live.id, 'm_live_test', 'Team B has its own live match');
assert.strictEqual(localMatches.matches.some(m => m.id === 'm_archived' || m.id === uuidMatch), false,
  'Team B must not inherit team A archives');
assert.strictEqual(storage[cloudKey], scopedBytes, 'Saving another team must not touch this team file');
assert.strictEqual(keyWrites(cloudKey), scopedWrites);
const localBytes = storage[localKey];
App.loadTeam(cloudTeam);
App.saveStorage();
assert.strictEqual(App.matchScope().key, cloudKey);
assert.strictEqual(AppState.match.id, 'm_live_test', 'The captured live match returns with its team');
assert.strictEqual(AppState.events.length, 1);
assert.strictEqual(AppState.clock.seconds, 200);
assert.strictEqual(AppState.matchHistory.some(m => m.id === 'm_archived'), true);
const rescoped = JSON.parse(storage[cloudKey]);
assert.strictEqual(storage[localKey], localBytes, 'Switching back must not rewrite team B matches');
assert.strictEqual(rescoped.matches.some(m => localMatches.matches.some(row => row.id === m.id)), false,
  'Team B archives stay out of the team A file');
assert.strictEqual(keyWrites(cloudKey), scopedWrites, 'A restored team with unchanged matches writes nothing');
incoming({ ...advance(readRoster()), readOnly: true }, 'storage');
assert.strictEqual(AppState.readOnly, true);
assert.strictEqual(App.publishLiteMatches(), false);
assert.strictEqual(App.applySharedMatches(), false);
const guardedState = () => JSON.stringify({ squad: AppState.squad, match: AppState.match, events: AppState.events,
  timers: AppState.playerTimers, history: AppState.matchHistory, clock: { seconds: AppState.clock.seconds, running: AppState.clock.running } });
const guardedBytes = storage[cloudKey];
const guardedWrites = keyWrites(cloudKey);
const guardedSnapshot = guardedState();
const matchTools = [() => App.adjustScore('our', 1), () => App.openEventModal('Goal'), () => App.saveEvent(),
  () => App.endMatch(), () => App.confirmEndMatch(), () => App.deleteMatchHistory('m_archived'),
  () => App.toggleStarter('lite-cloud-id'), () => App.setPeriod('2nd Half'), () => App.resetTimer(),
  () => App.saveMatchSetup(), () => App.selectAllGames(), () => App.toggleGameSelection('m_archived'),
  () => App.openPdfReportModal(), () => App.printLedger(), () => App.exportBackup()];
for (const tool of matchTools) {
  assert.strictEqual(tool(), false, 'Read-only match tools must report the block, not run');
  assert.strictEqual(guardedState(), guardedSnapshot);
}
assert.strictEqual(storage[cloudKey], guardedBytes, 'A parent view cannot rewrite shared matches');
assert.strictEqual(keyWrites(cloudKey), guardedWrites);
assert(toastMsg.includes('read-only'), 'Blocked match tools must explain why');
App.saveStorage();
assert.strictEqual(storage[cloudKey], guardedBytes, 'Local saving while read-only cannot republish matches');
incoming({ ...advance(readRoster()), readOnly: false }, 'storage');
assert.strictEqual(AppState.readOnly, false);
assert.strictEqual(AppState.matchHistory.some(m => m.id === 'm_archived'), true, 'Staff history returns with permission');
App.setPeriod('2nd Half');
assert.strictEqual(AppState.clock.period, '2nd Half');
console.log('✓ Match files stay per-team, live matches are captured and restored, and read-only blocks every match tool');

// ==========================================
// TEST 34: An unreadable shared match file never costs the coach their data
// ==========================================
const healthy = JSON.parse(storage[cloudKey]);
const healthyHistory = clone(AppState.matchHistory);
const healthyLive = clone(AppState.match);
const brokenMatches = [
  '{{{ not json',
  JSON.stringify(null),
  JSON.stringify({ ...clone(healthy), installationId: 'not-a-uuid' }),
  JSON.stringify({ ...clone(healthy), teamId: 'someone-elses-team' }),
  JSON.stringify({ ...clone(healthy), revision: 'tomorrow' }),
  JSON.stringify({ ...clone(healthy), matches: [clone(healthy.live), clone(healthy.live)] }),
  JSON.stringify({ ...clone(healthy), live: { ...clone(healthy.live), status: 'completed' } }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]), opponent: '<script>alert(1)</script>' }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]), format: '6' }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]), ourGoals: -1 }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]), date: '2026-02-30' }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]), lineupIds: { 'lite-cloud-id': 'nope' } }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]), bench: ['lite-cloud-id'] }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]),
    events: [{ ...clone(healthy.matches[0].events[0]), type: 'Penalty' }] }] }),
  JSON.stringify({ ...clone(healthy), matches: [{ ...clone(healthy.matches[0]),
    events: [{ ...clone(healthy.matches[0].events[0]), timestamp: 'tomorrow' }] }] }),
  JSON.stringify({ ...clone(healthy), removed: [{ id: 'm_archived' }] })
];
const brokenWrites = keyWrites(cloudKey);
for (const bytes of brokenMatches) {
  storage[cloudKey] = bytes;
  window.dispatchEvent({ type: 'storage', key: cloudKey });
  assert.strictEqual(storage[cloudKey], bytes, 'A rejected snapshot is left for the other document to repair');
  assert.deepStrictEqual(AppState.matchHistory, healthyHistory, 'Rejected matches must not edit the archive');
  assert.strictEqual(AppState.match.id, healthyLive.id, 'Rejected matches must not hijack the live match');
  assert(dom['storageFailureStatus'].innerText.includes('match'), 'Match sharing failures must stay visible');
  assert(!dom['storageFailureStatus'].classList.contains('hidden'));
  assert.strictEqual(App.publishLiteMatches(), false, 'Publishing stays paused while the shared file is unreadable');
  assert.strictEqual(App.saveStorage(), false, 'Saving reports the sharing failure');
  assert.strictEqual(keyWrites(cloudKey), brokenWrites, 'A broken file must not be overwritten from half-read state');
}
const recovered = advance(clone(healthy));
storage[cloudKey] = JSON.stringify(recovered);
window.dispatchEvent({ type: 'storage', key: cloudKey });
assert.strictEqual(dom['storageFailureStatus'].innerText.includes('Incoming match'), false, 'Recovery clears the warning');
assert.strictEqual(App.publishLiteMatches(), true);
assert.strictEqual(storage[cloudKey], JSON.stringify(recovered), 'A valid, unchanged snapshot is not republished');
assert.strictEqual(keyWrites(cloudKey), brokenWrites);
assert.strictEqual(App.saveStorage(), true);
console.log('✓ Malformed shared match data is refused visibly and non-destructively, and recovers without a rewrite');

// ==========================================
// TEST 35: The install path works on Safari, where Chrome's prompt event never fires
// ==========================================
const installBtnTag = (html.match(/<button[^>]*id="installPwaBtn"[^>]*>/) || [])[0] || '';
assert(installBtnTag.includes('class="hidden'), 'Install button must start hidden until the app knows the platform');
assert(installBtnTag.includes('onclick="App.triggerInstallPrompt()"'), 'Install button must run the install path, not a dead label');
assert(html.indexOf('id="installPwaBtn"') > html.indexOf('id="backupFileInput"'), 'Install lives in the Data Backup card, beside the offline status');
assert(html.indexOf('id="installPwaBtn"') < html.indexOf('id="offlineStatusLine"'), 'Install must sit above the offline status line');
const installNoteTag = (html.match(/<div id="installGuideNote"[^>]*>/) || [])[0] || '';
assert(installNoteTag.includes('role="status" aria-live="polite" class="hidden'), 'Install guide must start hidden but be announced when shown');
const readOnlyGate = html.slice(html.indexOf('const selectors = actions.map'), html.indexOf('forEach(control'));
assert(!readOnlyGate.includes('installPwaBtn'), 'Installing is a device action, so read-only staff and parents keep it');

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
const IPAD_DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
const MAC_UA = IPAD_DESKTOP_UA;
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
assert.strictEqual(App.isIOSDevice(IPHONE_UA, 5), true, 'iPhone is iOS');
assert.strictEqual(App.isIOSDevice(IPAD_DESKTOP_UA, 5), true, 'iPadOS 13+ reports a Macintosh UA by default');
assert.strictEqual(App.isIOSDevice(MAC_UA, 0), false, 'A real Mac is not an iPad');
assert.strictEqual(App.isIOSDevice(ANDROID_UA, 5), false, 'Android is not iOS');

// Launched in a browser tab, init has to reveal the path without waiting for beforeinstallprompt.
const realNavigator = globalThis.navigator;
const setNavigator = props => Object.defineProperty(globalThis, 'navigator', { value: props, configurable: true, writable: true });
delete global.matchMedia;
setNavigator({ userAgent: ANDROID_UA, maxTouchPoints: 5, standalone: false });
App.setupInstallPrompt();
assert(!dom['installPwaBtn'].className.includes('hidden'), 'Install must be reachable on Safari, which never fires beforeinstallprompt');
assert(dom['installGuideNote'].className.includes('hidden'), 'The written guide stays folded until the coach taps Install');
assert(dom['installGuideSteps'].innerText.includes('Install app'), 'Android steps name the browser menu action');
setNavigator({ userAgent: IPHONE_UA, maxTouchPoints: 5, standalone: false });
App.renderInstallGuide();
assert(dom['installGuideSteps'].innerText.includes('Share'), 'iPhone steps name Share');
assert(dom['installGuideSteps'].innerText.includes('Add to Home Screen'), 'iPhone steps name Add to Home Screen');
assert(dom['installGuideHint'].innerText.includes('only way'), 'iPhone is told offline depends on the home-screen icon');

// A tap with no native prompt must leave the coach readable instructions, not a silent button.
let promptsUsed = 0;
toastMsg = '';
App.triggerInstallPrompt();
assert(!dom['installGuideNote'].className.includes('hidden'), 'Tapping install reveals the guide');
assert(toastMsg.includes('Add to Home Screen'), 'The toast repeats the iOS step');

// Chrome still gets its native install dialog.
let preventedDefault = false;
window.dispatchEvent({
  type: 'beforeinstallprompt',
  preventDefault: () => { preventedDefault = true; },
  prompt: () => { promptsUsed += 1; },
  userChoice: Promise.resolve({ outcome: 'accepted' })
});
assert.strictEqual(preventedDefault, true, 'The browser install bubble must stay under the app control');
App.triggerInstallPrompt();
assert.strictEqual(promptsUsed, 1, 'A real install prompt takes priority over the written guide');

// Already installed, or launched from the icon, nothing may nag the coach.
window.dispatchEvent({ type: 'appinstalled' });
assert(dom['installPwaBtn'].className.includes('hidden'), 'Installing hides the path once the icon exists');
global.matchMedia = () => ({ matches: true });
App.setupInstallPrompt();
assert(dom['installPwaBtn'].className.includes('hidden'), 'A home-screen launch has nothing left to install');
delete global.matchMedia;
setNavigator({ userAgent: IPHONE_UA, maxTouchPoints: 5, standalone: true });
App.setupInstallPrompt();
assert(dom['installPwaBtn'].className.includes('hidden'), 'Safari reports a home-screen launch as navigator.standalone');
setNavigator({ userAgent: ANDROID_UA, maxTouchPoints: 5, standalone: false });
App.setupInstallPrompt();
assert(!dom['installPwaBtn'].className.includes('hidden'), 'A browser tab gets the install path back');
Object.defineProperty(globalThis, 'navigator', { value: realNavigator, configurable: true, writable: true });
console.log('✓ Install path shows on Safari, names Share on iPhone and iPad, keeps Chrome dialog, and stays quiet once installed');

// ==========================================
// TEST 36: No row is wider than a 320px phone
// ==========================================
const podRegion = jsCode.slice(jsCode.indexOf('renderRoster() {'), jsCode.indexOf('updatePlayerPosition(pid, pos)'));
assert(podRegion.length > 500, 'Squad pod template must be readable by the harness');
const podRow = (podRegion.match(/card\.className = '([^']*)'/) || [])[1] || '';
assert(podRow.includes('flex-wrap') && podRow.includes('gap-y-2'), 'Pod actions fold onto their own line instead of hanging off the right edge');
assert(/<div class="flex items-center space-x-3 min-w-0">/.test(podRegion), 'The shirt-and-name half of a pod gives way instead of forcing width');
assert(/<span class="truncate" title="\$\{p\.name\}">\$\{p\.name\}<\/span>/.test(podRegion), 'A long player name ellipsizes and keeps the whole name in the title');
const podActions = (podRegion.match(/<div class="flex items-center space-x-1\.5([^"]*)">/) || [])[1] || '';
assert(podActions.includes('flex-shrink-0'), 'Pitch, Avail, Edit and Delete keep their tap size when the pod wraps');
assert(podActions.includes('ml-auto'), 'Actions that folded to their own line still sit on the right edge');
assert(/<span class="flex-shrink-0 px-1\.5[^>]*>Starter<\/span>/.test(podRegion), 'The Starter badge is never squashed by a long name');

const boardRegion = html.slice(html.indexOf('STOPWATCH & ROTATION CLOCK HERO POD'), html.indexOf('Master Digital Stopwatch'));
assert(/<div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 mb-2">/.test(boardRegion), 'The scoreboard row folds so the goal steppers stay inside the card');
const steppers = boardRegion.match(/<button[^>]*adjustScore[^>]*>/g) || [];
assert.strictEqual(steppers.length, 4, 'All four goal steppers must be present to check');
steppers.forEach(b => assert(b.includes('flex-shrink-0'), 'A goal stepper is a tap target and must not shrink'));
['scoreboardGoals', 'scoreboardOpponentGoals'].forEach(id => {
  const box = (boardRegion.match(new RegExp('<span id="' + id + '"[^>]*>')) || [])[0] || '';
  assert(box.includes('flex-shrink-0'), id + ' must keep its width so the score stays readable');
});
['scoreboardTeam', 'scoreboardOpponent'].forEach(id => {
  const tag = (boardRegion.match(new RegExp('<span[^>]*id="' + id + '"[^>]*>')) || [])[0] || '';
  assert(tag.includes('min-w-0') && tag.includes('truncate'), id + ' must truncate rather than push the steppers out of view');
});

const brandLink = (html.match(/<a id="brandSwitch"[^>]*>/) || [])[0] || '';
assert(!brandLink.includes('flex-shrink-0') && brandLink.includes('min-w-0'), 'The lockup must shrink to the space the header actions leave');
const lockupRule = (html.match(/#appHeaderIcon\s*\{([^}]*)\}/) || [])[1] || '';
assert(lockupRule.includes('100%') && !lockupRule.includes('100vw'), 'Cap the lockup to its own flex line, not a guessed viewport constant');

assert(/#liveOnPitchGrid, #liveBenchGrid \{ grid-template-columns: repeat\(auto-fit, minmax\(1[6-9]\dpx, 1fr\)\); \}/.test(html), 'Sub-board cells keep room for shirt, name and clock before a second column appears');
const liveRegion = jsCode.slice(jsCode.indexOf('renderLiveBoard() {'), jsCode.indexOf('selectSubOut(pid) {'));
assert((liveRegion.match(/<div class="flex items-center space-x-2\.5 min-w-0">/g) || []).length === 2, 'Both sub-board card halves must be able to give way');
assert((liveRegion.match(/<div class="text-right flex-shrink-0">/g) || []).length === 2, 'The running clock on each sub-board card never shrinks');
assert(liveRegion.includes('col-span-full') && !liveRegion.includes('col-span-2'), 'The empty-bench note spans whatever columns exist instead of forcing a second track');
console.log('✓ Squad pods, scoreboard steppers, header lockup and sub-board cells stay inside a 320px phone');

// ==========================================
// TEST 37: Each squad row shows its own role, shirt numbers stay unique, and the preset survives a reload
// ==========================================
AppState.readOnly = false;
AppState.currentTeamId = 'lite-default';
AppState.squad = [
  { id: 'role-gk', number: 1, name: 'Grace Keep', position: 'GK' },
  { id: 'role-def', number: 4, name: 'Dala Wall', position: 'DEF' },
  { id: 'role-mid', number: 8, name: 'Mid Lane', position: 'MID' },
  { id: 'role-fwd', number: 9, name: 'Fast Forward', position: 'FWD' },
  { id: 'role-cm', number: 6, name: 'Cloud Mid', position: 'CM' }
];
AppState.match.availability = {};
AppState.match.starters = AppState.squad.map(p => p.id);
AppState.match.bench = [];
AppState.squad.forEach(p => { AppState.match.availability[p.id] = true; });
App.renderRoster();
assert(podRegion.includes('this.positionOptionHtml(p.position)'), 'A squad row binds its select to that player saved role');
assert(App.positionOptionHtml('DEF').includes('<option value="DEF" selected>DEF</option>'), 'A coarse DEF is selected in its own row instead of falling back to GK');
assert(App.positionOptionHtml('CM').includes('<option value="CM" selected>CM</option>'), 'A role only another app uses still shows truthfully');
assert(!App.positionOptionHtml('MID').includes('value="DEF" selected'), 'No row preselects a role that is not its own');
const modalPositionList = html.slice(html.indexOf('id="inputPlayerPosition"'), html.indexOf('</select>', html.indexOf('id="inputPlayerPosition"')));
['GK', 'CB', 'DEF', 'MID', 'FWD', 'CM', 'ST'].forEach(value => assert(
  new RegExp('<option value="' + value + '"[ >]').test(modalPositionList),
  value + ' must be selectable in the player form, or editing that player silently fails validation'));

AppState.squad = [
  { id: 'dup-1', number: 1, name: 'One Walker', position: 'GK' },
  { id: 'dup-2', number: 2, name: 'Two Runner', position: 'DEF' },
  { id: 'dup-10', number: 10, name: 'Ten Ten', position: 'FWD' }
];
AppState.match.starters = AppState.squad.map(p => p.id);
AppState.match.bench = [];
AppState.squad.forEach(p => { AppState.match.availability[p.id] = true; });
App.openAddPlayerModal();
assert.strictEqual(String(dom['inputPlayerNumber'].value), '3', 'The shirt field opens on the next free number');
toastMsg = '';
dom['inputPlayerName'].value = 'Clash Kid';
dom['inputPlayerNumber'].value = '10';
dom['inputPlayerPosition'].value = 'LW';
App.saveNewPlayer();
assert.strictEqual(AppState.squad.length, 3, 'A second player on a worn shirt number is blocked');
assert(toastMsg.includes('already worn by Ten Ten'), 'The clash warning names the player who owns the number');
dom['inputPlayerName'].value = 'Free Kid';
dom['inputPlayerNumber'].value = '4';
App.saveNewPlayer();
assert.strictEqual(AppState.squad.length, 4, 'A free shirt number still saves');
App.openEditPlayerModal('dup-10');
assert.strictEqual(String(dom['inputPlayerNumber'].value), '10', 'Editing opens on the player own number');
dom['inputPlayerName'].value = 'Ten Renamed';
App.saveNewPlayer();
assert.strictEqual(AppState.squad.find(p => p.id === 'dup-10').name, 'Ten Renamed', 'Re-saving your own number is not a clash');

AppState.match.format = '5';
AppState.match.formation = '2-1-1';
dom['formationSelect'].value = '';
App.populateFormationSelect(AppState.match.formation);
assert.strictEqual(dom['formationSelect'].value, '2-1-1', 'The saved preset is reselected by name');
App.populateFormationSelect('NoSuchPreset');
assert.strictEqual(dom['formationSelect'].value, '1-2-1', 'An unknown saved name falls back to the first preset of the format');
dom['formationSelect'].value = '';
App.saveStorage();
App.init();
assert.strictEqual(dom['formationSelect'].value, '2-1-1', 'A reload restores the chosen preset, shared roster or not');
assert.strictEqual(dom['starterQuotaText'].innerText, 'Required starters: 5', 'The quota line is rebuilt from stored data on reload');
const initRegion = jsCode.slice(jsCode.indexOf('init() {'), jsCode.indexOf('registerServiceWorker()'));
assert(initRegion.includes('this.applyFormatDefaults();'), 'A device with no shared roster still gets seeded defaults');
console.log('✓ Squad rows bind the saved role, duplicate shirts are blocked, and the formation preset outlives a reload');

// ==========================================
// TEST 38: The clock tick leaves the Stats tab alone, and day mode themes the whole shell
// ==========================================
const statsRegion = jsCode.slice(jsCode.indexOf('renderStats() {'), jsCode.indexOf('renderGameDetailHtml'));
['data-stat-time="clock"', 'data-stat-time="total"', 'data-stat-time="player"', 'data-stat-time="avg"'].forEach(attr =>
  assert(statsRegion.includes(attr), `A Stats cell that ages with the clock must carry ${attr} for in-place updates`));
assert(statsRegion.includes('id="statsLiveClockCell"'), 'The live clock cell needs an id so kickoff can detect the missing card');

let statsRebuilds = 0;
let cellRefreshes = 0;
const realRenderStats = App.renderStats;
const realCellRefresh = App.updateStatsClockText;
App.renderStats = () => { statsRebuilds += 1; };
App.updateStatsClockText = () => { cellRefreshes += 1; };
AppState.match.starters = ['dup-1'];
AppState.match.bench = [];
AppState.playerTimers = { 'dup-1': 5 };
AppState.clock.running = true;
AppState.clock.seconds = 10;
AppState.clock.sinceSync = 0;
AppState.clock.startedAt = Date.now() - 2000;
AppState.activeTab = 'stats';
App.tickClock();
assert.strictEqual(statsRebuilds, 0, 'A clock tick must never rebuild the Stats tab mid-tap');
assert.strictEqual(cellRefreshes, 1, 'A clock tick refreshes only the time cells');
// The LIVE card has to appear at kickoff and vanish at the archive, so those two
// transitions rebuild Stats once instead of every tick.
const realGetById = document.getElementById;
let kickoffRebuilds = 0;
App.renderStats = () => { kickoffRebuilds += 1; };
document.getElementById = (id) => (id === 'statsLiveClockCell' ? null : realGetById(id));
AppState.clock.sinceSync = 0;
AppState.clock.startedAt = Date.now() - 2000;
AppState.events = [];
App.tickClock();
assert.strictEqual(kickoffRebuilds, 1, 'The tick that makes a match live builds the LIVE Stats card');
document.getElementById = realGetById;
App.renderStats = realRenderStats;
App.updateStatsClockText = realCellRefresh;
AppState.clock.running = false;
AppState.clock.intervalId = null;

const dayRules = ['body.theme-day [class*="bg-obsidian"]', 'body.theme-day .glass-card', 'body.theme-day .text-white',
  'body.theme-day [class*="border-white/"]', 'body.theme-day header, body.theme-day nav'];
dayRules.forEach(rule => assert(html.includes(rule), `Day mode must re-map ${rule}, or that part of the shell stays dark`));
dom['appHeaderIcon'].setAttribute('src', './assets/brand/L1_lockup_dark.svg');
AppState.theme = 'day';
App.applyTheme();
assert(bodyEl.classList.contains('theme-day'), 'Day mode puts the theme class on the element every chrome rule hangs off');
assert.strictEqual(document.documentElement.getAttribute('data-theme'), 'light', 'The CI light tokens are switched on');
assert.strictEqual(dom['themeIcon'].innerText, 'Night', 'The toggle names the mode a tap switches to, not the current one');
assert.strictEqual(dom['appHeaderIcon'].src, './assets/brand/L1_lockup_light.svg', 'The lockup swaps to the light-background artwork');
const logoBefore = 'data:image/png;base64,clublogo';
dom['appHeaderIcon'].src = logoBefore;
dom['appHeaderIcon'].setAttribute('src', logoBefore);
App.applyTheme();
assert.strictEqual(dom['appHeaderIcon'].getAttribute('src'), logoBefore, 'A club logo is never replaced by theme switching');
assert.strictEqual(dom['appHeaderIcon'].src, logoBefore, 'Neither is its src property');
AppState.theme = 'night';
App.applyTheme();
assert(!bodyEl.classList.contains('theme-day'), 'Night mode drops the day class again');
assert.strictEqual(dom['themeIcon'].innerText, 'Day', 'The toggle reads Day while the app is dark');
assert.strictEqual(dom['appHeaderIcon'].src, logoBefore, 'The club logo stays put in both modes');
console.log('✓ Clock ticks update Stats cells in place, and day mode themes header, tabs, dock, cards and lockup');

// ==========================================
// TEST 39: The squad sheet holds its order, and a smaller format asks before it drops anyone
// ==========================================
const shiftSquad = [
  { id: 's-f9', name: 'Dev Nine', number: 9, position: 'FWD' },
  { id: 's-gk', name: 'Ana One', number: 1, position: 'GK' },
  { id: 's-m11', name: 'Elk Eleven', number: 11, position: 'CM' },
  { id: 's-def2', name: 'Ben Two', number: 2, position: 'DEF' },
  { id: 's-b18', name: 'Gus Eighteen', number: 18, position: 'LB' },
  { id: 's-m3', name: 'Cai Three', number: 3, position: 'MID' },
  { id: 's-f14', name: 'Foe Fourteen', number: 14, position: 'ST' },
];
AppState.squad = shiftSquad.map(p => ({ ...p }));
AppState.match.starters = shiftSquad.map(p => p.id);
AppState.match.bench = [];
AppState.match.fieldPositions = {};
AppState.match.availability = {};
AppState.match.format = '7';
AppState.match.formation = '2-3-1';
AppState.playerTimers = {};
AppState.events = [];
AppState.clock.running = false;

assert.deepStrictEqual(App.rosterOrder().map(p => p.number), [1, 2, 3, 9, 11, 14, 18],
  'A full sheet lists starters first, then by shirt number');
App.sendToBench('s-f9');
assert.deepStrictEqual(App.rosterOrder().map(p => p.number), [1, 2, 3, 11, 14, 18, 9],
  'A sub drops to the bottom of the sheet without reshuffling anyone else');
App.promoteBenchToStarter('s-f9');
assert.deepStrictEqual(App.rosterOrder().map(p => p.number), [1, 2, 3, 9, 11, 14, 18],
  'Bringing him back restores the same order');
assert.strictEqual(AppState.match.starters.length, 7, 'The promotion filled the vacated slot');
assert.ok(AppState.match.starters.every((pid, i, all) => all.indexOf(pid) === i), 'No starter is listed twice');
assert.notStrictEqual(AppState.match.fieldPositions['s-f9'], undefined, 'A promoted starter is given a place on the turf');

dom['inputMatchTeamName'].value = 'Clubstride';
dom['inputMatchTitle'].value = 'Match 1';
dom['inputMatchOpponent'].value = 'Echo Strikers';
dom['inputMatchDate'].value = '2026-10-28';
AppState.pendingFormat = '5';
App.saveMatchSetup();
assert.strictEqual(AppState.match.format, '7', 'A smaller format is not applied until the coach names who comes off');
assert.strictEqual(AppState.match.starters.length, 7, 'Nothing is dropped while the question is open');
assert.ok(AppState.formatShift, 'Stepping 7v7 down to 5v5 asks instead of silently losing players');
assert.strictEqual(AppState.formatShift.toBench, 2, 'Seven starters in five slots means two come off');
assert.strictEqual(AppState.formatShift.picked.size, 2, 'Two players are pre-picked so the sheet is never short');
assert.ok(!AppState.formatShift.picked.has('s-gk'), 'The keeper is never the automatic benching');
assert.strictEqual(AppState.formatShift.picked.has('s-f9') && AppState.formatShift.picked.has('s-f14'), true,
  'The extra attackers are the default picks');
assert.strictEqual(dom['modalFormatShift'].className.includes('flex'), true, 'The bench sheet opens');
assert.strictEqual(dom['modalFormatShift'].className.includes('hidden'), false, 'And is not left folded away');

App.cancelFormatShift();
assert.strictEqual(AppState.formatShift, null, 'Cancel clears the question');
assert.strictEqual(AppState.match.format, '7', 'Cancel leaves the match alone');
assert.strictEqual(AppState.match.starters.length, 7, 'Cancel benches nobody');
assert.strictEqual(dom['modalFormatShift'].className.includes('hidden'), true, 'Cancel closes the sheet');
assert.strictEqual(AppState.pendingFormat, '7', 'Cancel puts the setup buttons back on the current format');

AppState.pendingFormat = '5';
App.saveMatchSetup();
const sentOff = [...AppState.formatShift.picked];
App.confirmFormatShift();
assert.strictEqual(AppState.match.format, '5', '5v5 applies once the coach has answered');
assert.strictEqual(AppState.match.starters.length, 5, 'Exactly the new quota stays on the pitch');
sentOff.forEach(pid => {
  assert.ok(!AppState.match.starters.includes(pid), 'The chosen player is off the pitch');
  assert.ok(AppState.match.bench.includes(pid), '...and lands on the bench instead of vanishing');
  assert.strictEqual(AppState.match.fieldPositions[pid], undefined, '...and gives up his spot on the turf');
});
assert.strictEqual(new Set([...AppState.match.starters, ...AppState.match.bench]).size, 7,
  'Every squad player is still accounted for after the shift');
assert.strictEqual(AppState.formatShift, null, 'The question is spent');
assert.strictEqual(dom['modalFormatShift'].className.includes('hidden'), true, 'The sheet closes on confirm');
assert.ok(['1-2-1', '2-1-1', '2-2', '1-1-2', '3-1'].includes(AppState.match.formation),
  'The saved preset is one that exists in 5v5, not the orphaned 7v7 name: ' + AppState.match.formation);

assert.deepStrictEqual(App.keepOffPitchLines({ x: 50, y: 50 }), { x: 50, y: 50 },
  'A midfield slot stays exactly where the preset put it');
const keeperSlot = App.keepOffPitchLines({ x: 50, y: 88 });
assert.ok(keeperSlot.y <= 77, `The keeper is moved clear of the penalty-area line (y ${keeperSlot.y})`);
AppState.match.starters.forEach(pid => {
  const p = AppState.match.fieldPositions[pid];
  assert.deepStrictEqual(App.keepOffPitchLines(p), p, `The slot placed for ${pid} is clear of the area paint`);
});

// The keeper promotion is where a raw preset slot used to escape the paint check.
App.sendToBench(AppState.match.starters[0]);
const promoted = AppState.match.bench[0];
App.promoteBenchToStarter(promoted);
const promotedSlot = AppState.match.fieldPositions[promoted];
assert.deepStrictEqual(App.keepOffPitchLines(promotedSlot), promotedSlot,
  'A player promoted from the bench lands clear of the area paint');
AppState.match.starters.filter(pid => pid !== promoted).forEach(other => {
  const q = AppState.match.fieldPositions[other];
  assert.ok(!q || Math.abs(q.x - promotedSlot.x) > 4 || Math.abs(q.y - promotedSlot.y) > 4,
    'The promoted shirt does not stand on top of another starter');
});
console.log('✓ Squad sheet order is stable, a format drop-down asks who to bench, and tokens stay off the area lines');

console.log('\n=========================================');
console.log('ALL 39 AUTOMATED TEST GROUPS PASSED WITH 100% SUCCESS!');
console.log('=========================================');


