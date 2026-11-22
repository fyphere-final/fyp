import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Inbox, Lock } from 'lucide-react';
import { t } from '../../lib/strings';
import { pct as fmtPct } from '../../lib/format';

export function Button({ as: As = 'button', variant = 'primary', className = '', ...rest }) {
  const v = { primary: 'btn-primary', gold: 'btn-gold', outline: 'btn-outline' }[variant];
  return <As className={`btn ${v} ${className}`} {...(As === 'button' ? { type: 'button' } : {})} {...rest} />;
}

export function Spinner({ className = '' }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

export const Skeleton = ({ className = '' }) => <div aria-hidden className={`skeleton ${className}`} />;

export function ProgressBar({ value = 0, className = '', tone = 'gold', thick = false }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      dir="ltr"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={`w-full min-w-0 overflow-hidden rounded-full bg-cream-deep ${thick ? 'h-3' : 'h-2'} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ${tone === 'gold' ? 'bg-gold' : 'bg-maroon'}`}
        style={{ width: `${v}%` }}
      />
    </div>
  );
}

/** Circular score indicator (Result screens). */
export function ScoreRing({ value, label, size = 'md' }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dim = size === 'lg' ? 'h-44 w-44 sm:h-52 sm:w-52' : 'h-40 w-40 sm:h-44 sm:w-44';
  return (
    <div className={`relative mx-auto ${dim} shrink-0`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="58" className="fill-cream-deep/70" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E9D8B8" strokeWidth="7" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke="#C49C5C" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, value)) / 100)}
          className="transition-[stroke-dashoffset] duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="font-ui text-3xl font-bold leading-tight text-maroon sm:text-4xl">{fmtPct(value)}</span>
        <span className="ui-text mt-0.5 text-xs text-ink-soft">{label}</span>
      </div>
    </div>
  );
}

/** Maroon page header used by every in-app screen. */
export function PageHeader({ subtitle, title, backTo, onBack, right, curved = false, children }) {
  return (
    <header className={`bg-maroon text-white ${curved ? 'rounded-b-[2.25rem]' : ''}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
        <div className="min-w-0 flex-1">
          {subtitle && <p className="ui-text truncate text-sm text-gold-soft">{subtitle}</p>}
          <h1 className="ui-text break-words text-2xl font-bold leading-[1.8] sm:text-3xl">{title}</h1>
          {children}
        </div>
        {(backTo || onBack) && (
          <BackButton to={backTo} onClick={onBack} />
        )}
        {right}
      </div>
    </header>
  );
}

export function BackButton({ to, onClick }) {
  const cls =
    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 text-white transition hover:bg-white/20';
  return to ? (
    <Link to={to} aria-label={t.back} className={cls}><ChevronLeft size={22} /></Link>
  ) : (
    <button type="button" onClick={onClick} aria-label={t.back} className={cls}><ChevronLeft size={22} /></button>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="card mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center">
      <AlertTriangle className="text-bad" size={32} />
      <p className="ui-text font-bold">{t.errorTitle}</p>
      {message && <p className="ui-text text-sm text-ink-soft">{message}</p>}
      {onRetry && <button type="button" onClick={onRetry} className="btn btn-outline">{t.retry}</button>}
    </div>
  );
}

export function EmptyState({ message, icon: Icon = Inbox }) {
  return (
    <div className="card mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center">
      <Icon className="text-gold" size={32} />
      <p className="ui-text text-ink-soft">{message}</p>
    </div>
  );
}

export function LockBadge({ className = '' }) {
  return (
    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-deep text-ink-soft/60 ${className}`}>
      <Lock size={18} />
    </span>
  );
}

/** A/ب/ج/د multiple choice option. */
export function ChoiceOption({ letter, selected, state, disabled, onClick, children, arabic = false }) {
  // state: undefined | 'correct' | 'wrong'
  const tone =
    state === 'correct' ? 'border-ok bg-ok-soft' : state === 'wrong' ? 'border-bad bg-bad-soft'
    : selected ? 'border-maroon bg-maroon-soft/60' : 'border-cream-line bg-white hover:border-gold';
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
      className={`flex min-h-[3.25rem] w-full min-w-0 items-center gap-3 rounded-xl border px-4 py-2 text-start transition ${tone}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-ui text-sm font-bold ${badge}`}>{letter}</span>
      <span className={`min-w-0 flex-1 break-words ${arabic ? 'arabic text-2xl' : 'urdu text-lg'} ${selected ? 'font-bold' : ''}`}>{children}</span>
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
