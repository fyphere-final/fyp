/** Mosque mark used on Welcome, Login and the desktop rail. */
export function BrandMark({ className = 'h-14 w-14', stroke = '#C49C5C', bg = 'none' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill={bg} aria-hidden>
      <rect x="1.5" y="1.5" width="61" height="61" rx="18" stroke={stroke} strokeWidth="1.5" fill={bg} />
      <g fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 11v5M29.5 13.5h5" />
        <path d="M21 30c0-8 5-13 11-13s11 5 11 13" />
        <path d="M17 30h30v17H17z" />
        <path d="M27 47V38c0-3 2-5 5-5s5 2 5 5v9" />
        <path d="M13 47h38" />
      </g>
    </svg>
  );
}
