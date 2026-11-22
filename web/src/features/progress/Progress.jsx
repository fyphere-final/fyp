import { useState } from 'react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { formatDate, num, pct } from '../../lib/format';
import { Check, ChevronDown } from 'lucide-react';
import { LockIcon } from '../../components/NavIcons';
import { EmptyState, ErrorState, Page, PageHeader, ProgressBar, Skeleton } from '../../components/ui';

function UnitProgress({ unit }) {
  const [open, setOpen] = useState(false);
  if (unit.locked) {
    return (
      <div className="min-w-0 rounded-[20px] border border-cream-track bg-[#F8F3EB] px-[15px] py-[14px]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="ui-text min-w-0 text-[13px] font-bold leading-[23px] text-ink-soft">{unit.title}</h3>
          <span className="ui-text inline-flex shrink-0 items-center gap-1 text-[12px] font-bold text-ink-soft"><LockIcon size={12} />{t.locked}</span>
        </div>
        <p className="ui-text mt-2.5 text-[11px] leading-4 text-ink-faint">{t.lockedUnitNote}</p>
      </div>
    );
  }
  return (
    <section className="rounded-[20px] border border-cream-track bg-white px-[15px] py-[14px] shadow-card">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="block min-h-[46px] w-full text-start">
        <span className="flex items-center justify-between gap-3">
          <span className="ui-text min-w-0 text-[13px] font-bold leading-6 text-ink">{unit.title}</span>
          <span className="flex shrink-0 items-center gap-1">
            <span className="font-ui text-[11px] font-bold text-ink">{pct(unit.percent)}</span>
          </span>
        </span>
        <ProgressBar value={unit.percent} className="mt-3" />
      </button>
      {open && (
        <ul className="fade-in mt-3 divide-y divide-cream-track">
          {unit.lessons.filter((l) => l.playable && !l.locked).map((l) => (
            <li key={l.lessonNo} className="flex min-w-0 items-center justify-between gap-3 py-2.5">
              <span className="urdu !py-0 min-w-0 flex-1 text-[14px] !leading-[30px]">{l.completed && <Check size={13} className="me-1 inline text-ok" />}{l.title}</span>
              <span className="ui-text shrink-0 text-[10.7px] text-ink-soft">
                {t.exerciseScore} {l.exerciseBestPct != null ? pct(l.exerciseBestPct) : '—'} · {t.quizScore} {l.quizBestPct != null ? pct(l.quizBestPct) : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Screen 10 - Student Progress: overall %, per-unit/lesson scores, learning history. */
export default function Progress() {
  const { data, error, loading, reload } = useAsync(studentApi.progress, []);
  return (
    <>
      <PageHeader subtitle={t.student} title={t.progressTitle} backTo="/dashboard" />
      <Page className="!pt-[27px]">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="h-[130px] !rounded-[26px]" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : (
          <div className="fade-in grid min-w-0 gap-[26px] lg:grid-cols-[22rem_1fr] lg:items-start">
            <section className="rounded-[26px] bg-maroon px-5 pb-5 pt-[22px] text-white lg:sticky lg:top-6">
              <div className="flex items-center justify-between gap-3">
                <p className="ui-text text-[12.5px] font-medium text-gold-soft">{t.overallProgress}</p>
                <p dir="ltr" className="font-sans text-[26px] font-bold leading-9">{pct(data.overallPercent)}</p>
              </div>
              <ProgressBar value={data.overallPercent} onDark className="mt-[14px]" />
              <p className="ui-text mt-[14px] text-[11.4px] leading-5 text-cream-deep">{t.progressNote}</p>
            </section>

            <div className="min-w-0 space-y-8">
              <section>
                <p className="ui-text text-[11.7px] font-bold leading-4 text-label">{t.detail}</p>
                <h2 className="ui-text mb-[14px] text-[20px] font-normal leading-[30px]">{t.byUnit}</h2>
                {data.units.length ? <div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{data.units.map((u) => <UnitProgress key={u.unitno} unit={u} />)}</div> : <EmptyState message={t.emptyUnits} />}
              </section>

              <section>
                <h2 className="ui-text mb-3 text-[20px] font-normal leading-[30px]">{t.history}</h2>
                {data.history.length ? (
                  <ul className="card divide-y divide-cream-track !rounded-[20px]">
                    {data.history.map((h) => (
                      <li key={h.attemptId} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="urdu truncate text-[14px] leading-[30px]">{h.lessonTitle ?? `${t.lesson} ${num(h.lessonNo)}`}</p>
                          <p className="ui-text text-[10.7px] text-ink-soft">{t.kind[h.kind]} · {formatDate(h.createdAt)}</p>
                        </div>
                        <span dir="ltr" className={`font-sans shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${h.kind === 'reassess' || h.passed ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>{pct(h.scorePct)}</span>
                      </li>
                    ))}
                  </ul>
                ) : <EmptyState message={t.emptyHistory} />}
              </section>
            </div>
          </div>
        )}
      </Page>
    </>
  );
}
