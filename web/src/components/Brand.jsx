/**
 * Mosque mark from the Welcome mockup, redrawn from measurements (viewBox 90x90):
 * outer ring Ø90, inner ring Ø72 (50% opacity), glyph strokes 2.3px.
 * Finial with flat base, round dome over the central body, door arch, two minarets
 * (cap bar + shaft + shoulder) and a wide baseline.
 */
export function BrandMark({ className = 'h-[90px] w-[90px]', stroke = '#C6A15B' }) {
  return (
    <svg viewBox="0 0 90 90" className={className} fill="none" aria-hidden>
      <circle cx="45" cy="45" r="44.5" stroke={stroke} strokeWidth="1" />
      <circle cx="45" cy="45" r="36" stroke={stroke} strokeOpacity=".5" strokeWidth="1" />
      <g stroke={stroke} strokeLinecap="round" strokeLinejoin="round" transform="translate(45 64.3) scale(.92 .985) translate(-45 -64.3)">
        <g strokeWidth="2.3">
          {/* finial */}
          <path d="M45 22.4V28" />
          <path d="M39.6 29.6H50.4" strokeWidth="3" strokeLinecap="butt" />
          {/* dome + central body */}
          <path d="M33.9 64V47.2A11 11 0 0 1 55.9 47.2V64" />
          {/* door */}
          <path d="M39.8 64V55A5 5 0 0 1 49.8 55V64" />
          {/* left minaret: cap, shaft, shoulder */}
          <path d="M28.3 37.8H34.4M29.7 37.8V47.4M27.5 64V47.4H29.7" />
          {/* right minaret */}
          <path d="M61.5 37.8H55.4M60.1 37.8V47.4M62.3 64V47.4H60.1" />
        </g>
        {/* baseline */}
        <path d="M23.4 64.3H66.4" strokeWidth="3" />
      </g>
    </svg>
  );
}
