import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { t } from '../../lib/strings';
import { urduNum } from '../../lib/format';
import { LockBadge, ProgressBar } from '../../components/ui';

export function UnitCard({ unit }) {
  const body = (
    <>
      <div className="min-w-0 flex-1 text-start">
        <p className="ui-text text-xs font-bold text-ink-soft">{t.unit} {urduNum(unit.unitno)}</p>
        <h3 className={`urdu text-lg font-bold sm:text-xl ${unit.locked ? 'text-ink-soft' : 'text-ink'}`}>{unit.title}</h3>
        {unit.locked ? (
          <p className="ui-text mt-1.5 text-xs text-ink-soft">{t.unlockHint}</p>
        ) : (
          <p className="ui-text mt-0.5 text-sm text-ink-soft">{urduNum(unit.completedCount)}/{urduNum(unit.lessonCount)} {t.lessons}</p>
        )}
        <ProgressBar value={unit.locked ? 0 : unit.percent} className="mt-2.5" />
      </div>
      {unit.locked ? <LockBadge /> : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream-deep font-ui text-lg font-bold text-maroon">{urduNum(unit.unitno)}</span>
      )}
    </>
  );
  const base = 'flex min-w-0 items-center gap-3 rounded-2xl border p-4 sm:p-5';
  return unit.locked ? (
    <div aria-disabled className={`${base} border-cream-line/70 bg-cream-deep/40 opacity-70`}>{body}</div>
  ) : (
    <Link to={`/units/${unit.unitno}/lessons`} className={`${base} card items-center transition hover:border-gold hover:shadow-md`}>
      <ChevronLeft size={20} className="shrink-0 text-ink-soft" />
      {body}
    </Link>
  );
}

export default function UnitList({ units }) {
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {units.map((u) => <UnitCard key={u.unitno} unit={u} />)}
    </div>
  );
}
