import { Link, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { num } from '../../lib/format';
import { ErrorState, Page, PageHeader, ScoreRing, Skeleton } from '../../components/ui';

/** Screen 8 - Result / Score (also the result view for Screen 9 Re-assess). */
export default function Result() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const { data: r, error, loading, reload } = useAsync(() => studentApi.attempt(attemptId), [attemptId]);

  const isRe = r?.kind === 'reassess';
  const base = r ? `/units/${r.unitno}/lessons/${r.lessonNo}` : '';
  const showNext = r && r.nextLesson && !r.nextLesson.locked && (r.passed || r.lessonCompleted);
  const wrongCount = r?.wrong ?? 0;
  const first = user?.name?.split(' ')[0] ?? '';
  const primary = 'btn btn-primary !min-h-[46px]';

  return (
    <>
      <PageHeader subtitle={r ? `${r.unitTitle ?? ''} · ${t.unit} ${num(r.unitno)}` : ''} title={isRe ? t.reassessResultTitle : t.resultTitle} backTo={r ? `/units/${r.unitno}/lessons` : '/dashboard'} />
      <Page className="max-w-4xl !pt-[37px]">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="mx-auto h-[150px] w-[150px] !rounded-full" /><Skeleton className="h-20" /></div> : (
          <div className="fade-in space-y-6 lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 lg:space-y-0">
            <div className="text-center">
              <ScoreRing value={r.scorePct} label={isRe ? t.reassessScore : t.totalScore} />
              <p className="ui-text mt-[17px] text-[15.3px] font-medium leading-7">{r.passed ? t.wellDone(first) : t.tryAgain(first)}</p>
              <p className="ui-text mt-1 text-[12.7px] leading-5 text-ink-soft">{t.youGot(num(r.correct), num(r.total))}</p>
              {!isRe && (
                <p className={`ui-text mx-auto mt-3 inline-block rounded-full px-4 py-1 text-[11px] font-bold ${r.passed ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>
                  {r.passed ? t.passed : t.failed(num(r.passPercent))}
                </p>
              )}
            </div>

            <div className="min-w-0 space-y-[22px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex h-[79px] flex-col items-center justify-center rounded-[18px] border border-cream-track bg-white"><p className="font-sans text-[22px] font-bold leading-8 text-maroon">{num(r.correct)}</p><p className="ui-text text-[11px] leading-4 text-ink-soft">{t.right}</p></div>
                <div className="flex h-[79px] flex-col items-center justify-center rounded-[18px] border border-cream-track bg-white"><p className="font-sans text-[22px] font-bold leading-8 text-maroon">{num(r.wrong)}</p><p className="ui-text text-[11px] leading-4 text-ink-soft">{t.wrong}</p></div>
              </div>

              <div className="flex flex-col gap-[11px]">
                {wrongCount > 0 && <Link to={`${base}/reassess?attemptId=${r.attemptId}`} className={primary}>{t.retryWrong}</Link>}
                {showNext && <Link to={`/units/${r.nextLesson.unitno}/lessons/${r.nextLesson.lessonNo}/sabaq`} className={primary}>{t.nextLesson}</Link>}
                {!r.lessonCompleted && (isRe || !r.passed) && <Link to={`${base}/quiz`} className={wrongCount > 0 && !isRe ? 'btn btn-outline !min-h-[46px]' : primary}>{t.retakeQuiz}</Link>}
                <Link to="/dashboard" className="btn btn-outline !min-h-[46px]">{t.goHome}</Link>
              </div>

              {wrongCount > 0 && (
                <section className="card p-4">
                  <h2 className="ui-text mb-2 text-[12.5px] font-bold">{t.reviewTitle}</h2>
                  <ul className="divide-y divide-cream-track">
                    {r.review.filter((x) => !x.isCorrect).map((x) => (
                      <li key={x.qid} className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
                        <span className="arabic text-[22px] text-ink" lang="ar" dir="rtl">{x.prompt}</span>
                        <span className="min-w-0 text-end">
                          <span className="ui-text flex items-center gap-1 text-[12px] text-bad"><X size={13} />{x.chosen ?? t.notAnswered}</span>
                          <span className="ui-text flex items-center gap-1 text-[12px] font-bold text-ok"><Check size={13} />{x.correct}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        )}
      </Page>
    </>
  );
}
