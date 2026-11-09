/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Parent View: CollectionPortal Component - Fee collection, subscriptions, & payment portals
 */

export function renderCollectionPortal({
  playerName = 'Amelia Vance',
  items = [
    { id: 'sub-oct', title: 'Monthly Subscriptions (Oct 2026)', amount: 'R 250.00', status: 'paid', date: '01 Oct 2026' },
    { id: 'sub-nov', title: 'Monthly Subscriptions (Nov 2026)', amount: 'R 250.00', status: 'pending', date: '01 Nov 2026' },
    { id: 'fee-tourney', title: 'District Youth Cup Registration', amount: 'R 150.00', status: 'pending', date: '15 Nov 2026' }
  ],
  totalOutstanding = 'R 400.00'
} = {}) {
  const itemRows = items.map(item => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div>
        <p class="text-xs font-bold text-white">${item.title}</p>
        <span class="text-[10px] text-white/50">Due: ${item.date}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs font-black text-white">${item.amount}</span>
        <span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${item.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}">
          ${item.status === 'paid' ? 'PAID' : 'DUE'}
        </span>
      </div>
    </div>
  `).join('');

  return `
    <div class="antigravity-card p-5 mb-4">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-sm font-black text-white flex items-center gap-1.5">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            Fee Collection Portal
          </h3>
          <p class="text-xs text-white/70">Player: ${playerName}</p>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-white/60 block">Outstanding</span>
          <span class="text-sm font-black text-amber-400">${totalOutstanding}</span>
        </div>
      </div>

      <!-- Outstanding / History List -->
      <div class="space-y-2 mb-4">
        ${itemRows}
      </div>

      <!-- Quick Checkout Portal -->
      <div class="flex gap-2">
        <button id="btn-pay-now" class="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white ethereal-glow-turf flex items-center justify-center gap-2 active:scale-95 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          Settle Dues (PayFast / Card)
        </button>
      </div>
    </div>
  `;
}

export default renderCollectionPortal;
