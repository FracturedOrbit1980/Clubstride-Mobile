/**
 * Club Stride Mobile - Antigravity UI Architecture
 * StatRing Component - Floating circular progress ring with fluid physics
 */

export function renderStatRing({
  value = 75,
  max = 100,
  label = 'Pace',
  size = 72,
  strokeWidth = 6,
  colorGradient = 'primary', // 'primary' or 'turf'
  icon = ''
} = {}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value / max, 0), 1);
  const strokeDashoffset = circumference - (progress * circumference);
  
  const gradId = `statGrad-${Math.random().toString(36).substr(2, 9)}`;
  const [stop1, stop2] = colorGradient === 'turf'
    ? ['#27AE60', '#2ECC71']
    : ['#4A90E2', '#8E2DE2'];

  return `
    <div class="stat-ring-container flex flex-col items-center group cursor-pointer" style="width: ${size}px;">
      <div class="relative" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <defs>
            <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${stop1}" />
              <stop offset="100%" stop-color="${stop2}" />
            </linearGradient>
          </defs>
          <!-- Background track -->
          <circle
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke="rgba(255, 255, 255, 0.12)"
            stroke-width="${strokeWidth}"
            fill="transparent"
          />
          <!-- Value ring -->
          <circle
            class="stat-ring-circle"
            cx="${size / 2}"
            cy="${size / 2}"
            r="${radius}"
            stroke="url(#${gradId})"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            fill="transparent"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${strokeDashoffset}"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-xs font-black text-white leading-none">${value}</span>
          ${icon ? `<span class="text-[9px] mt-0.5">${icon}</span>` : ''}
        </div>
      </div>
      ${label ? `<span class="mt-1 text-[11px] font-semibold text-white/80 group-hover:text-white transition-colors">${label}</span>` : ''}
    </div>
  `;
}

export default renderStatRing;
