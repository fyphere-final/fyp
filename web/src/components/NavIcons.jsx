/**
 * Bottom-navigation icons redrawn from the mockups (measured at 16x zoom).
 * They are not square: each has its own aspect ratio, centred in a 24px box by the nav item.
 * `currentColor` is used so the active/inactive colours come from the nav item.
 */
const base = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

/** Pitched-roof house with eaves, walls, door and base line (16 x 15). */
export function HomeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 16 15" className={`h-[15px] w-[16px] ${className}`} strokeWidth="1.4" {...base}>
      <path d="M0.6 7.7L7.9 0.9L15.2 7.7" />
      <path d="M2.3 7.3V14.4H13.5V7.3" />
      <path d="M5.5 14.4V8.7H10.5V14.4" />
    </svg>
  );
}

/** Standing book: rounded top, centre spine, shelf line, small feet (15 x 20). */
export function UnitsIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 15 20" className={`h-[19px] w-[14.5px] ${className}`} strokeWidth="1.4" {...base}>
      <path d="M0.9 19.2Q1.6 17.9 1.1 16.6L1 3.1Q1 0.8 3.3 0.8H11.4Q13.7 0.8 13.7 3.1L13.8 16.6Q13.3 17.9 14 19.2" />
      <path d="M7.4 0.8V15.4" />
      <path d="M1.1 15.6Q7.4 14.8 13.7 15.6" />
    </svg>
  );
}

/** Three separate bars on a baseline, no axes (17.6 x 14.4). */
export function ChartIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 17.6 14.4" className={`h-[14.4px] w-[17.6px] ${className}`} {...base}>
      <path d="M2.1 13V5.4M7 13V0.8M11.9 13V7.6" strokeWidth="1.9" strokeLinecap="butt" />
      <path d="M0.7 13.6H16.9" strokeWidth="1.4" />
    </svg>
  );
}

/** Padlock with keyhole dot: shackle 7 wide, body 8.8 x 6.8 (10 x 12). */
export function LockIcon({ className = '', size = 12 }) {
  return (
    <svg viewBox="0 0 10 12" style={{ height: size, width: (size * 10) / 12 }} className={className} strokeWidth="1.05" {...base}>
      <path d="M2.7 4.7V3.4A2.3 2.3 0 0 1 7.3 3.4V4.7" />
      <rect x="0.9" y="4.7" width="8.2" height="6.4" rx="1.3" />
      <path d="M5 7V8.7" strokeWidth="1.1" />
    </svg>
  );
}

/** Thin back/forward chevron used on cards (pointing left in RTL). */
export function ChevronIcon({ className = '', dir = 'left' }) {
  return (
    <svg viewBox="0 0 8 12" className={`h-[12px] w-[8px] ${dir === 'down' ? '-rotate-90' : ''} ${className}`} strokeWidth="1.3" {...base}>
      <path d="M6.6 0.9L1.5 6L6.6 11.1" />
    </svg>
  );
}

/** Logout: door bracket with an arrow leaving to the right (11 x 10). */
export function LogoutIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 11 10" className={`h-[10px] w-[11px] ${className}`} strokeWidth="1.1" {...base}>
      <path d="M4.2 0.8H1.5Q0.6 0.8 0.6 1.7V8.3Q0.6 9.2 1.5 9.2H4.2" />
      <path d="M3.8 5H10.2M8 2.8L10.2 5L8 7.2" />
    </svg>
  );
}

/** Profile: round head over shoulder arc, as in the bottom bar (16 x 18). */
export function ProfileIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 16 18" className={`h-[18px] w-[16px] ${className}`} strokeWidth="1.4" {...base}>
      <circle cx="8" cy="4.6" r="3.4" />
      <path d="M1.2 16.9Q1.6 10.4 8 10.4T14.8 16.9" />
    </svg>
  );
}
