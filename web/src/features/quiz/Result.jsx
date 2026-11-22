import { Link, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { urduNum } from '../../lib/format';
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

  return (
    <>
      <PageHeader subtitle={r ? `${r.unitTitle ?? ''} · ${t.unit} ${urduNum(r.unitno)}` : ''} title={isRe ? t.reassessResultTitle : t.resultTitle} backTo={r ? `/units/${r.unitno}/lessons` : '/dashboard'} />
      <Page className="max-w-4xl">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="mx-auto h-44 w-44 !rounded-full" /><Skeleton className="h-24" /></div> : (
          <div className="fade-in space-y-6 lg:grid lg:grid-cols-[auto_1fr] lg:items-center lg:gap-12 lg:space-y-0">
            <div className="text-center">
              <ScoreRing value={r.scorePct} label={isRe ? t.reassessScore : t.totalScore} size="lg" />
              <p className="ui-text mt-5 text-lg font-bold">{r.passed ? t.wellDone(user?.name ?? '') : t.tryAgain(user?.name ?? '')}</p>
              <p className="ui-text mt-1 text-sm text-ink-soft">{t.youGot(urduNum(r.correct), urduNum(r.total))}</p>
              {!isRe && (
                <p className={`ui-text mx-auto mt-3 inline-block rounded-full px-4 py-1 text-xs font-bold ${r.passed ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>
                  {r.passed ? t.passed : t.failed(urduNum(r.passPercent))}
                </p>
              )}
            </div>

            <div className="min-w-0 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="card p-4 text-center"><p className="font-ui text-3xl font-bold text-maroon">{urduNum(r.correct)}</p><p className="ui-text text-xs text-ink-soft">{t.right}</p></div>
                <div className="card p-4 text-center"><p className="font-ui text-3xl font-bold text-maroon">{urduNum(r.wrong)}</p><p className="ui-text text-xs text-ink-soft">{t.wrong}</p></div>
              </div>

              <div className="flex flex-col gap-3">
                {wrongCount > 0 && (
                  <Link to={`${base}/reassess?attemptId=${r.attemptId}`} className="btn btn-primary !py-3.5">{t.retryWrong}</Link>
                )}
                {!r.passed && !r.lessonCompleted && (
                  <Link to={`${base}/quiz`} className={`btn !py-3.5 ${wrongCount > 0 ? 'btn-outline' : 'btn-primary'}`}>{t.retakeQuiz}</Link>
                )}
                {showNext && (
                  <Link to={`/units/${r.nextLesson.unitno}/lessons/${r.nextLesson.lessonNo}/sabaq`} className={`btn !py-3.5 ${wrongCount > 0 ? 'btn-outline' : 'btn-primary'}`}>{t.nextLesson}</Link>
                )}
                <Link to="/dashboard" className="btn btn-outline !py-3.5">{t.goHome}</Link>
              </div>

              {wrongCount > 0 && (
                <section className="card p-4">
                  <h2 className="ui-text mb-2 text-sm font-bold">{t.reviewTitle}</h2>
                  <ul className="divide-y divide-cream-line">
                    {r.review.filter((x) => !x.isCorrect).map((x) => (
                      <li key={x.qid} className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                        <span className="arabic text-2xl text-maroon-dark" lang="ar" dir="rtl">{x.prompt}</span>
                        <span className="min-w-0 text-end">
                          <span className="urdu flex items-center gap-1 text-sm text-bad"><X size={14} />{x.chosen ?? t.notAnswered}</span>
                          <span className="urdu flex items-center gap-1 text-sm font-bold text-ok"><Check size={14} />{x.correct}</span>
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
