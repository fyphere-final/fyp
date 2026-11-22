import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { OPTION_LETTERS, num } from '../../lib/format';
import { Button, ChoiceOption, ErrorState, Page, PageHeader, ProgressBar, Skeleton, Spinner } from '../../components/ui';

/**
 * One-question-at-a-time multiple choice runner.
 * Used by Screen 7 (Quiz / Jaiza) and Screen 9 (Re-assess).
 */
export default function QuizRunner({ load, submit, title, banner }) {
  const { unitno, lessonNo } = useParams();
  const nav = useNavigate();
  const { data, error, loading, reload } = useAsync(load, [unitno, lessonNo]);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const q = data?.questions[i];
  const last = data && i === data.questions.length - 1;

  async function next() {
    if (!answers[q.qid]) return;
    if (!last) return setI((n) => n + 1);
    setBusy(true); setMsg('');
    try {
      const res = await submit(data.token, answers);
      nav(`/results/${res.attemptId}`, { replace: true });
    } catch (e) { setMsg(errorMessage(e)); setBusy(false); }
  }

  return (
    <>
      <PageHeader subtitle={data ? `${data.unitTitle} · ${t.unit} ${num(unitno)}` : ''} title={`${t.lesson} ${num(lessonNo)} · ${title}`} backTo={`/units/${unitno}/lessons`} />
      <Page className="max-w-2xl !pt-[27px]">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="h-5" /><Skeleton className="h-80 !rounded-3xl" /></div> : (
          <div className="fade-in">
            {banner && (
              <div className="mb-5 rounded-[18px] border border-gold-soft bg-cream-deep px-4 py-[14px]">
                <p className="ui-text text-[11.7px] font-bold leading-5 text-ink">{t.reassessBannerTitle}</p>
                <p className="ui-text mt-1 text-[11px] leading-[19px] text-ink-soft">{t.reassessBanner}</p>
              </div>
            )}
            <p className="ui-text text-[11.7px] leading-4 text-ink-soft">{t.qOf(num(i + 1), num(data.total))}</p>
            <ProgressBar value={((i + 1) / data.total) * 100} className="mt-2.5" />

            <section key={q.qid} className="fade-in mt-[16px] rounded-3xl border border-cream-track bg-white px-[18px] pb-[18px] pt-[19px] shadow-card">
              <p className="ui-text text-center text-[12.8px] leading-5 text-ink-soft">{t.quizQ}</p>
              <p className="arabic !py-0 mt-[12px] text-center text-[34px] !leading-[1.7] text-ink" lang="ar" dir="rtl">{q.prompt}</p>
              <div role="radiogroup" aria-label={t.quizQ} className="mt-[14px] grid gap-2.5 sm:grid-cols-2">
                {q.options.map((o, idx) => (
                  <ChoiceOption key={o} letter={OPTION_LETTERS[idx]} selected={answers[q.qid] === o}
                    onClick={() => setAnswers((a) => ({ ...a, [q.qid]: o }))}>{o}</ChoiceOption>
                ))}
              </div>
            </section>

            {msg && <p role="alert" className="ui-text mt-3 rounded-xl bg-bad-soft px-4 py-3 text-[12.5px] text-bad">{msg}</p>}
            <Button onClick={next} disabled={!answers[q.qid] || busy} className="mt-[17px] w-full !min-h-[48px] !rounded-[14px] !text-[13.7px]">
              {busy && <Spinner />}{last ? t.submitAnswers : t.nextQ}
            </Button>
          </div>
        )}
      </Page>
    </>
  );
}
