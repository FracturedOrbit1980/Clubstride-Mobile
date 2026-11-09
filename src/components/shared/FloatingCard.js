/**
 * Club Stride Mobile - Antigravity UI Architecture
 * FloatingCard Component - Glassmorphic card with physics-based elevations
 */

export function renderFloatingCard({
  id = '',
  title = '',
  subtitle = '',
  badge = '',
  variant = 'default', // 'default', 'dark', 'primary-glow', 'turf-glow'
  contentHtml = '',
  actionsHtml = '',
  onClick = null
} = {}) {
  const variantClass = variant === 'dark' 
    ? 'antigravity-card-dark' 
    : 'antigravity-card';
  
  const glowOverlay = variant === 'primary-glow'
    ? '<div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 pointer-events-none rounded-[24px]"></div>'
    : variant === 'turf-glow'
    ? '<div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 pointer-events-none rounded-[24px]"></div>'
    : '';

  return `
    <div id="${id}" class="${variantClass} p-5 relative overflow-hidden backdrop-blur-xl border border-white/20 transition-all duration-300">
      ${glowOverlay}
      <div class="relative z-10 flex flex-col h-full justify-between">
        ${(title || badge) ? `
          <div class="flex items-center justify-between mb-3">
            <div>
              ${title ? `<h3 class="text-base font-bold text-white tracking-wide">${title}</h3>` : ''}
              ${subtitle ? `<p class="text-xs text-white/70">${subtitle}</p>` : ''}
            </div>
            ${badge ? `<span class="glass-pill px-2.5 py-1 text-xs font-semibold text-white/90 border border-white/25">${badge}</span>` : ''}
          </div>
        ` : ''}
        <div class="card-body">
          ${contentHtml}
        </div>
        ${actionsHtml ? `
          <div class="card-actions mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            ${actionsHtml}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

export default renderFloatingCard;
