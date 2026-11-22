import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { OPTION_LETTERS, num, pct, urduNum } from '../../lib/format';
import { Button, ChoiceOption, ErrorState, Page, PageHeader, Skeleton, Spinner } from '../../components/ui';

const QPill = ({ n }) => (
  <span className="ui-text inline-flex h-5 items-center rounded-full bg-cream-deep px-3 text-[10.5px] font-bold text-maroon">{t.q} {urduNum(n)}</span>
);
const sameOpt = (a, b) => (a ?? '').trim() === (b ?? '').trim();

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
      <PageHeader subtitle={data ? `${data.unitTitle} · ${t.unit} ${num(unitno)}` : ''} title={`${t.lesson} ${num(lessonNo)} · ${t.mashq}`} backTo={`/units/${unitno}/lessons`} />
      <Page className="max-w-5xl !pt-8">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="h-64 !rounded-[22px]" /><Skeleton className="h-56 !rounded-[22px]" /></div> : (
          <div className="fade-in">
            <h2 className="ui-text text-[24px] font-normal leading-9">{t.mashqTitle}</h2>
            <div className="mt-[23px] grid min-w-0 items-start gap-4 lg:grid-cols-2">
              {data.sections.map((s) => s.kind === 'type' ? (
                <section key="type" className="card min-w-0 px-[17px] pb-[18px] pt-[21px]">
                  <QPill n={1} />
                  <p className="ui-text mt-2 text-[14px] leading-5">{t.mashqQ1}</p>
                  <ul className="mt-[10px] space-y-[10.5px]">
                    {s.questions.map((q) => {
                      const r = review[q.qid];
                      return (
                        <li key={q.qid} className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1.5">
                            <span className="arabic !py-0 min-w-[92px] max-w-full shrink-0 text-[17px] !leading-[43px] text-ink" lang="ar" dir="rtl">{q.prompt}</span>
                            <input value={answers[q.qid] ?? ''} disabled={!!result}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.qid]: e.target.value }))}
                              aria-label={q.prompt} autoComplete="off" spellCheck={false}
                              className={`field ui-text min-w-[10rem] flex-1 !min-h-[44px] ${r ? (r.isCorrect ? '!border-ok !bg-ok-soft' : '!border-bad !bg-bad-soft') : ''}`} />
                          </div>
                          {r && (
                            <p className={`ui-text mt-1 flex items-center gap-1.5 text-[12px] font-bold ${r.isCorrect ? 'text-ok' : 'text-bad'}`}>
                              {r.isCorrect ? <Check size={14} /> : <X size={14} />}
                              {r.isCorrect ? t.right : <>{t.correctAnswer}: <span className="text-[13px]">{r.correct}</span></>}
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
                  <section key={q.qid} className="card min-w-0 px-[17px] pb-[18px] pt-[21px]">
                    <QPill n={n} />
                    <p className="ui-text mt-2 text-[14px] leading-[22px]">{t.mashqChoice(q.prompt)}</p>
                    <div role="radiogroup" className="mt-[14px] grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {q.options.map((o, i) => {
                        const state = r ? (sameOpt(o, r.correct) ? 'correct' : sameOpt(o, r.chosen) ? 'wrong' : undefined) : undefined;
                        return <ChoiceOption key={o} arabic letter={OPTION_LETTERS[i]} selected={answers[q.qid] === o} state={state} disabled={!!result}
                          onClick={() => setAnswers((a) => ({ ...a, [q.qid]: o }))}>{o}</ChoiceOption>;
                      })}
                    </div>
                    {r && <p className={`ui-text mt-3 rounded-xl px-4 py-2.5 text-[12px] font-bold ${r.isCorrect ? 'bg-ok-soft text-ok' : 'bg-bad-soft text-bad'}`}>{r.isCorrect ? t.correctAnswer : `${t.correctAnswer}: ${r.correct}`}</p>}
                  </section>
                );
              }))}
            </div>

            {msg && <p role="alert" className="ui-text mt-4 rounded-xl bg-bad-soft px-4 py-3 text-[12.5px] text-bad">{msg}</p>}

            {result ? (
              <section className="fade-in mt-4 rounded-[22px] bg-maroon p-6 text-center text-white shadow-btn">
                <p className="ui-text text-[12.4px] font-bold text-gold-soft">{t.mashqResult}</p>
                <p dir="ltr" className="mt-1 font-sans text-[44px] font-bold leading-[1.2]">{pct(result.scorePct)}</p>
                <p className="ui-text mt-1 text-[12.5px] font-bold">{t.correctOf(num(result.correct), num(result.total))}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link to={`${base}/quiz`} className="btn btn-gold sm:min-w-[14rem]">{t.nextStage}</Link>
                  <button type="button" onClick={again} className="btn border border-white/40 text-white hover:bg-white/10">{t.retry}</button>
                </div>
              </section>
            ) : (
              <Button onClick={submit} disabled={busy} className="mt-4 w-full lg:mx-auto lg:w-80">{busy && <Spinner />}{t.submitMashq}</Button>
            )}
          </div>
        )}
      </Page>
    </>
  );
}
