import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Inbox } from 'lucide-react';
import { LockIcon } from '../NavIcons';
import { t } from '../../lib/strings';

export function Button({ as: As = 'button', variant = 'primary', className = '', ...rest }) {
  const v = { primary: 'btn-primary', gold: 'btn-gold', outline: 'btn-outline' }[variant];
  return <As className={`btn ${v} ${className}`} {...(As === 'button' ? { type: 'button' } : {})} {...rest} />;
}

export function Spinner({ className = '' }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export const Skeleton = ({ className = '' }) => <div aria-hidden className={`skeleton ${className}`} />;

/** 7px track (#EDDFCC) with gold fill growing from the left, as in the mockups. */
export function ProgressBar({ value = 0, className = '', onDark = false }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      dir="ltr"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={`h-[7px] w-full min-w-0 overflow-hidden rounded-full ${onDark ? 'bg-white/20' : 'bg-cream-track'} ${className}`}
    >
      <div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${v}%`, minWidth: v > 0 ? 7 : 0 }} />
    </div>
  );
}

/** Static ring from the Result mockups: gold outline, sand band, cream centre. */
export function ScoreRing({ value, label }) {
  return (
    <div className="relative mx-auto h-[150px] w-[150px] shrink-0 rounded-full border-[3px] border-gold bg-cream-deep">
      <div className="absolute inset-[11px] flex flex-col items-center justify-center rounded-full bg-cream">
        <span className="font-ui text-[30px] font-bold leading-9 text-maroon">{Math.round(value)}٪</span>
        <span className="ui-text relative top-[4px] text-[10.9px] leading-4 text-ink-soft">{label}</span>
      </div>
    </div>
  );
}

/**
 * Maroon page header (101px tall on mobile). Right: subtitle + title. Left: back button at (20, 31).
 * `curved` is the taller Dashboard variant.
 */
export function PageHeader({ subtitle, title, backTo, onBack, children, compact = false }) {
  return (
    <header className="relative bg-maroon text-white">
      <div className={`mx-auto w-full max-w-6xl px-5 pt-[24px] sm:px-6 lg:px-8 lg:pb-8 lg:pt-8 ${compact ? 'pb-[18px]' : 'pb-[26px]'}`}>
        <div className="min-w-0 pe-[52px]">
          {subtitle ? <p className="ui-text truncate text-[11.7px] leading-4 text-gold-soft">{subtitle}</p> : <p className="h-4" aria-hidden />}
          <h1 className="ui-text mt-[5px] break-words text-[20.5px] font-bold leading-[30px] lg:text-[26px]">{title}</h1>
          {children}
        </div>
        {(backTo || onBack) && (
          <div className="absolute end-[18px] top-[28.5px] lg:end-8 lg:top-8"><BackButton to={backTo} onClick={onBack} /></div>
        )}
      </div>
    </header>
  );
}

export function BackButton({ to, onClick }) {
  // 44px hit area around the 41px visual from the mockups
  const hit = 'inline-flex h-11 w-11 shrink-0 items-center justify-center';
  const visual = (
    <span className="inline-flex h-[41px] w-[41px] items-center justify-center rounded-xl border border-white/[0.28] bg-white/10 text-white transition group-hover:bg-white/20">
      <ChevronLeft size={20} />
    </span>
  );
  return to ? (
    <Link to={to} aria-label={t.back} className={`group ${hit}`}>{visual}</Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={t.back} className={`group ${hit}`}>{visual}</button>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="card mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
      <AlertTriangle className="text-bad" size={30} />
      <p className="ui-text text-[15px] font-bold">{t.errorTitle}</p>
      {message && <p className="ui-text text-[12.5px] leading-6 text-ink-soft">{message}</p>}
      {onRetry && <button type="button" onClick={onRetry} className="btn btn-outline">{t.retry}</button>}
    </div>
  );
}

export function EmptyState({ message, icon: Icon = Inbox }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <Icon className="text-gold" size={30} />
      <p className="ui-text text-[13px] text-ink-soft">{message}</p>
    </div>
  );
}

/** Small rounded square badge holding a lesson/unit number or a lock. */
export function NumBadge({ children, locked = false, className = '' }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-sans text-[18px] font-bold ${locked ? 'bg-[#F8EEDF] text-[#C9A9A5]' : 'bg-cream-deep text-maroon'} ${className}`}>
      {locked ? <LockIcon size={15} /> : children}
    </span>
  );
}

/** Multiple-choice option (ا / ب / ج / د). 47px high, 14px radius. */
export function ChoiceOption({ letter, selected, state, disabled, onClick, children, arabic = false }) {
  const tone =
    state === 'correct' ? 'border-ok bg-ok-soft' : state === 'wrong' ? 'border-bad bg-bad-soft'
    : selected ? 'border-maroon bg-[#FFF6EE]' : 'border-cream-line bg-white hover:border-gold';
  const badge =
    state === 'correct' ? 'bg-ok text-white' : state === 'wrong' ? 'bg-bad text-white'
    : selected ? 'bg-maroon text-white' : 'bg-cream-deep text-maroon';
  return (
    <button
      type="button"
      role="radio"
      aria-checked={!!selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[47px] w-full min-w-0 items-center gap-3 rounded-[14px] border-[1.5px] px-[13px] ${arabic ? 'py-0' : 'py-1'} text-start transition ${tone}`}
    >
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-ui text-[12px] font-bold ${badge}`}>{letter}</span>
      <span className={`min-w-0 flex-1 break-words ${arabic ? 'arabic !py-0 text-[18px] !leading-[41px]' : 'ui-text text-[15.5px] leading-7'} ${selected && !arabic ? 'font-bold' : ''}`}>{children}</span>
    </button>
  );
}

export const Page = ({ children, className = '' }) => (
  <main className={`mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 ${className}`}>{children}</main>
);

export const SkeletonList = ({ rows = 3, className = 'h-24' }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className={className} />)}
  </div>
);
