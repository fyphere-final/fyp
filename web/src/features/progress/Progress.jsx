import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { formatDate, pct, urduNum } from '../../lib/format';
import { Check, Lock } from 'lucide-react';
import { EmptyState, ErrorState, Page, PageHeader, ProgressBar, Skeleton } from '../../components/ui';

function UnitProgress({ unit }) {
  if (unit.locked) {
    return (
      <div className="min-w-0 rounded-2xl border border-cream-line bg-cream-deep/50 p-4 opacity-80">
        <div className="flex items-start justify-between gap-3">
          <h3 className="urdu text-lg font-bold text-ink-soft">{unit.title}</h3>
          <span className="ui-text inline-flex shrink-0 items-center gap-1 text-xs font-bold text-ink-soft"><Lock size={14} />{t.locked}</span>
        </div>
        <p className="ui-text mt-1 text-xs text-ink-soft">{t.lockedUnitNote}</p>
      </div>
    );
  }
  return (
    <section className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="urdu min-w-0 text-lg font-bold">{unit.title}</h3>
        <span className="ui-text shrink-0 text-sm font-bold text-maroon">{pct(unit.percent)}</span>
      </div>
      <ProgressBar value={unit.percent} className="mt-2" />
      <p className="ui-text mt-1.5 text-xs text-ink-soft">{t.lessonsDone(urduNum(unit.completedCount), urduNum(unit.lessonCount))}</p>
      <ul className="mt-3 divide-y divide-cream-line">
        {unit.lessons.filter((l) => l.playable && !l.locked).map((l) => (
          <li key={l.lessonNo} className="flex min-w-0 items-center justify-between gap-3 py-2.5">
            <span className="urdu min-w-0 flex-1 text-base">{l.completed && <Check size={14} className="me-1 inline text-ok" />}{l.title}</span>
            <span className="ui-text shrink-0 text-xs text-ink-soft">
              {t.exerciseScore} {l.exerciseBestPct != null ? pct(l.exerciseBestPct) : '—'} · {t.quizScore} {l.quizBestPct != null ? pct(l.quizBestPct) : '—'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Screen 10 - Student Progress: overall %, per-unit/lesson scores, learning history. */
export default function Progress() {
  const { data, error, loading, reload } = useAsync(studentApi.progress, []);
  return (
    <>
      <PageHeader subtitle={t.student} title={t.progressTitle} />
      <Page>
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="h-36" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : (
          <div className="fade-in grid min-w-0 gap-6 lg:grid-cols-[22rem_1fr] lg:items-start">
            <section className="rounded-3xl bg-maroon p-5 text-white shadow-btn sm:p-6 lg:sticky lg:top-6">
              <div className="flex items-center justify-between gap-3">
                <p className="font-ui text-4xl font-bold">{pct(data.overallPercent)}</p>
                <p className="ui-text text-sm text-gold-soft">{t.overallProgress}</p>
              </div>
              <div dir="ltr" className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gold transition-[width] duration-700" style={{ width: `${data.overallPercent}%` }} /></div>
              <p className="ui-text mt-3 text-sm text-white/85">{t.lessonsDone(urduNum(data.completedLessons), urduNum(data.totalLessons))}</p>
              <p className="ui-text mt-1 text-xs leading-loose text-white/70">{t.progressNote}</p>
            </section>

            <div className="min-w-0 space-y-8">
              <section>
                <p className="ui-text text-xs font-bold text-ink-soft">{t.detail}</p>
                <h2 className="urdu mb-3 text-2xl">{t.byUnit}</h2>
                {data.units.length ? <div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{data.units.map((u) => <UnitProgress key={u.unitno} unit={u} />)}</div> : <EmptyState message={t.emptyUnits} />}
              </section>

              <section>
                <h2 className="urdu mb-3 text-2xl">{t.history}</h2>
                {data.history.length ? (
                  <ul className="card divide-y divide-cream-line">
                    {data.history.map((h) => (
                      <li key={h.attemptId} className="flex min-w-0 items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="urdu truncate text-base">{h.lessonTitle ?? `${t.lesson} ${urduNum(h.lessonNo)}`}</p>
                          <p className="ui-text text-xs text-ink-soft">{t.kind[h.kind]} · {formatDate(h.createdAt)}</p>
                        </div>
                        <span className={`ui-text shrink-0 rounded-full px-3 py-1 text-sm font-bold ${h.kind === 'reassess' || h.passed ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>{pct(h.scorePct)}</span>
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
