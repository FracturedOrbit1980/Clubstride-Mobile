/**
 * Club Stride Mobile - Antigravity UI Architecture
 * Parent View: ProfileBuilder Component - Standalone player profile creation & management
 */

export function renderProfileBuilder({
  profile = {
    name: 'Amelia Vance',
    dob: '2015-06-12',
    position: 'Midfield (CM)',
    jerseyNumber: 10,
    emergencyContact: '+27 82 123 4567',
    medicalNotes: 'Mild asthma, carries inhaler'
  }
} = {}) {
  return `
    <div class="antigravity-card-dark p-5 mb-4">
      <div class="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
        <div class="relative">
          <img src="./src/assets/avatar-parent.svg" alt="Avatar" class="w-12 h-12 rounded-full border-2 border-amber-400 shadow-md"/>
          <button class="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] text-slate-900 font-bold" title="Change Avatar">✎</button>
        </div>
        <div>
          <h3 class="text-sm font-black text-white">Standalone Profile Builder</h3>
          <p class="text-xs text-white/60">Create & update player profile</p>
        </div>
      </div>

      <form id="profile-builder-form" class="space-y-3" onsubmit="event.preventDefault();">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold uppercase text-white/70 mb-1">Player Name</label>
            <input type="text" value="${profile.name}" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"/>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase text-white/70 mb-1">Date of Birth</label>
            <input type="date" value="${profile.dob}" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"/>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold uppercase text-white/70 mb-1">Position</label>
            <input type="text" value="${profile.position}" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"/>
          </div>
          <div>
            <label class="block text-[10px] font-bold uppercase text-white/70 mb-1">Jersey Number</label>
            <input type="number" value="${profile.jerseyNumber}" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"/>
          </div>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase text-white/70 mb-1">Emergency Contact</label>
          <input type="text" value="${profile.emergencyContact}" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"/>
        </div>

        <div>
          <label class="block text-[10px] font-bold uppercase text-white/70 mb-1">Medical Notes</label>
          <textarea rows="2" class="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400">${profile.medicalNotes}</textarea>
        </div>

        <button type="submit" id="btn-save-profile" class="w-full py-2.5 rounded-xl text-xs font-bold text-white ethereal-glow-primary active:scale-95 transition-all">
          Save Profile
        </button>
      </form>
    </div>
  `;
}

export default renderProfileBuilder;
