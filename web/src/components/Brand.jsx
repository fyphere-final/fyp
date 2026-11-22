/** Mosque mark: double gold ring + arched mosque glyph (Welcome mockup). */
export function BrandMark({ className = 'h-[90px] w-[90px]', stroke = '#C6A15B' }) {
  return (
    <svg viewBox="0 0 90 90" className={className} fill="none" aria-hidden>
      <circle cx="45" cy="45" r="44.5" stroke={stroke} strokeWidth="1" />
      <circle cx="45" cy="45" r="36" stroke={stroke} strokeOpacity=".45" strokeWidth="1" />
      <g stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M45 22v6M42 25h6" />
        <path d="M32 63V47c0-8 5-14 13-14s13 6 13 14v16" />
        <path d="M40 63V54c0-3 2-5 5-5s5 2 5 5v9" />
        <path d="M26 63V50l3-3 3 3M58 63V50l3-3 3 3" strokeWidth="2" />
        <path d="M24 63h42" />
      </g>
    </svg>
  );
}
