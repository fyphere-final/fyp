import { Link } from 'react-router-dom';
import { ChevronIcon, LockIcon } from '../../components/NavIcons';
import { t } from '../../lib/strings';
import { num, urduWord } from '../../lib/format';
import { NumBadge, ProgressBar } from '../../components/ui';

export function UnitCard({ unit }) {
  const locked = unit.locked;
  const body = (
    <>
      <NumBadge locked={locked}>{num(unit.unitno)}</NumBadge>
      <div className="min-w-0 flex-1 text-start">
        <p className={`ui-text text-[10px] font-bold leading-[15px] ${locked ? 'text-[#BFA9A4]' : 'text-ink-soft'}`}>{t.unit} {num(unit.unitno)}</p>
        <h3 className={`ui-text mt-0.5 text-[14.6px] font-bold leading-5 ${locked ? 'text-ink-faint' : 'text-ink'}`}>{unit.title}</h3>
        <p className={`ui-text mt-1 text-[10.7px] leading-4 ${locked ? 'text-[#BFA9A4]' : 'text-ink-soft'}`}>
          {locked ? t.unlockHint : `${num(unit.lessonCount)} ${t.lessons} · ${urduWord(unit.lessonCount)} ${t.lessons}`}
        </p>
        <ProgressBar value={locked ? 0 : unit.percent} className="mt-2" />
      </div>
      {locked ? <LockIcon size={13} className="shrink-0 text-ink-lock" /> : <ChevronIcon className="shrink-0 text-ink-icon" />}
    </>
  );
  const base = 'flex min-w-0 items-center gap-[13px] rounded-[18px] border p-[15px]';
  return locked ? (
    <div aria-disabled className={`${base} border-[#F1E5D5] bg-[#FDF7EE]`}>{body}</div>
  ) : (
    <Link to={`/units/${unit.unitno}/lessons`} className={`${base} border-cream-track bg-white shadow-card transition hover:border-gold`}>{body}</Link>
  );
}

export default function UnitList({ units }) {
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {units.map((u) => <UnitCard key={u.unitno} unit={u} />)}
    </div>
  );
}
