import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { OPTION_LETTERS, pct, urduNum } from '../../lib/format';
import { Button, ChoiceOption, ErrorState, Page, PageHeader, Skeleton, Spinner } from '../../components/ui';

const QBadge = ({ n }) => (
  <span className="ui-text inline-block rounded-full bg-cream-deep px-3 py-0.5 text-xs font-bold text-maroon">{t.q} {urduNum(n)}</span>
);

/** Screen 6 - Exercise (Mashq): type meanings, then pick the correct Arabic spelling. */
export default function Exercise() {
  const { unitno, lessonNo } = useParams();
  const [run, setRun] = useState(0);
  const { data, error, loading, reload } = useAsync(() => studentApi.exercise(unitno, lessonNo), [unitno, lessonNo, run]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const base = `/units/${unitno}/lessons/${lessonNo}`;
  const review = result ? Object.fromEntries(result.review.map((r) => [r.qid, r])) : {};
  const allQs = data ? data.sections.flatMap((s) => s.questions) : [];

  async function submit() {
    if (allQs.some((q) => !(answers[q.qid] ?? '').trim())) return setMsg(t.answerAll);
    setBusy(true); setMsg('');
    try {
      setResult(await studentApi.exerciseSubmit(unitno, lessonNo, data.token, answers));
      requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    } catch (e) { setMsg(errorMessage(e)); } finally { setBusy(false); }
  }
  const again = () => { setAnswers({}); setResult(null); setMsg(''); setRun((r) => r + 1); window.scrollTo({ top: 0 }); };

  let choiceNo = 1;
  return (
    <>
      <PageHeader subtitle={data ? `${data.unitTitle} · ${t.unit} ${urduNum(unitno)}` : ''} title={`${t.lesson} ${urduNum(lessonNo)} · ${t.mashq}`} backTo={`/units/${unitno}/lessons`} />
      <Page className="max-w-5xl">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-56" /></div> : (
          <div className="fade-in space-y-5">
            <h2 className="urdu text-3xl">{t.mashqTitle}</h2>
            <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
              {data.sections.map((s, si) => s.kind === 'type' ? (
                <section key="type" className="card min-w-0 space-y-3 p-4 sm:p-5">
                  <QBadge n={1} />
                  <p className="ui-text text-sm">{t.mashqQ1}</p>
                  <ul className="space-y-3">
                    {s.questions.map((q) => {
                      const r = review[q.qid];
                      return (
                        <li key={q.qid} className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5">
                            <span className="arabic max-w-full shrink-0 text-3xl text-maroon-dark" lang="ar" dir="rtl">{q.prompt}</span>
                            <input value={answers[q.qid] ?? ''} disabled={!!result}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.qid]: e.target.value }))}
                              aria-label={q.prompt} placeholder={t.typeMeaning}
                              autoComplete="off" spellCheck={false}
                              className={`input urdu min-w-[10rem] flex-1 !py-1 text-lg ${r ? (r.isCorrect ? '!border-ok !bg-ok-soft' : '!border-bad !bg-bad-soft') : ''}`} />
                          </div>
                          {r && (
                            <p className={`ui-text mt-1 flex items-center gap-1.5 text-sm font-bold ${r.isCorrect ? 'text-ok' : 'text-bad'}`}>
                              {r.isCorrect ? <Check size={15} /> : <X size={15} />}
                              {r.isCorrect ? t.right : <>{t.correctAnswer}: <span className="urdu text-base">{r.correct}</span></>}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : s.questions.map((q) => {
                const n = ++choiceNo; const r = review[q.qid];
                return (
                  <section key={q.qid} className="card min-w-0 space-y-3 p-4 sm:p-5">
                    <QBadge n={n} />
                    <p className="urdu text-lg leading-[2.2]">{t.mashqChoice(q.prompt)}</p>
                    <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {q.options.map((o, i) => {
                        const state = r ? (sameOpt(o, r.correct) ? 'correct' : sameOpt(o, r.chosen) ? 'wrong' : undefined) : undefined;
                        return <ChoiceOption key={o} arabic letter={OPTION_LETTERS[i]} selected={answers[q.qid] === o} state={state} disabled={!!result}
                          onClick={() => setAnswers((a) => ({ ...a, [q.qid]: o }))}>{o}</ChoiceOption>;
                      })}
                    </div>
                    {r && <p className={`ui-text rounded-xl px-4 py-2.5 text-sm font-bold ${r.isCorrect ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>{r.isCorrect ? t.correctAnswer : `${t.correctAnswer}: ${r.correct}`}</p>}
                  </section>
                );
              }))}
            </div>

            {msg && <p role="alert" className="ui-text rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{msg}</p>}

            {result ? (
              <section className="fade-in space-y-3 rounded-2xl bg-maroon p-6 text-center text-white shadow-btn">
                <p className="ui-text text-sm text-gold-soft">{t.mashqResult}</p>
                <p className="font-ui text-5xl font-bold">{pct(result.scorePct)}</p>
                <p className="ui-text text-sm font-bold">{t.correctOf(urduNum(result.correct), urduNum(result.total))}</p>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
                  <Link to={`${base}/quiz`} className="btn btn-gold sm:min-w-[14rem]">{t.nextStage}</Link>
                  <button type="button" onClick={again} className="btn border border-white/40 text-white hover:bg-white/10">{t.retry}</button>
                </div>
              </section>
            ) : (
              <Button onClick={submit} disabled={busy} className="w-full lg:mx-auto lg:w-80">{busy && <Spinner />}{t.submitMashq}</Button>
            )}
          </div>
        )}
      </Page>
    </>
  );
}
const sameOpt = (a, b) => (a ?? '').trim() === (b ?? '').trim();
