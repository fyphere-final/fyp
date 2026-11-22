import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info } from 'lucide-react';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { OPTION_LETTERS, urduNum } from '../../lib/format';
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
      <PageHeader subtitle={data ? `${data.unitTitle} · ${t.unit} ${urduNum(unitno)}` : ''} title={`${t.lesson} ${urduNum(lessonNo)} · ${title}`} backTo={`/units/${unitno}/lessons`} />
      <Page className="max-w-2xl">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <div className="space-y-4"><Skeleton className="h-6" /><Skeleton className="h-80" /></div> : (
          <div className="fade-in space-y-4">
            {banner && (
              <div className="rounded-2xl border border-gold/50 bg-cream-deep p-4">
                <p className="ui-text flex items-center gap-2 text-sm font-bold"><Info size={16} className="text-gold-dark" />{t.reassessBannerTitle}</p>
                <p className="ui-text mt-1 text-sm leading-loose text-ink-soft">{t.reassessBanner}</p>
              </div>
            )}
            <p className="ui-text text-sm text-ink-soft">{t.qOf(urduNum(i + 1), urduNum(data.total))}</p>
            <ProgressBar value={((i + 1) / data.total) * 100} thick />

            <section key={q.qid} className="card fade-in space-y-5 p-4 sm:p-7">
              <p className="ui-text text-center text-sm text-ink-soft">{t.quizQ}</p>
              <p className="arabic text-center text-5xl text-maroon-dark sm:text-6xl" lang="ar" dir="rtl">{q.prompt}</p>
              <div role="radiogroup" aria-label={t.quizQ} className="grid gap-2.5 sm:grid-cols-2">
                {q.options.map((o, idx) => (
                  <ChoiceOption key={o} letter={OPTION_LETTERS[idx]} selected={answers[q.qid] === o}
                    onClick={() => setAnswers((a) => ({ ...a, [q.qid]: o }))}>{o}</ChoiceOption>
                ))}
              </div>
            </section>

            {msg && <p role="alert" className="ui-text rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{msg}</p>}
            <Button onClick={next} disabled={!answers[q.qid] || busy} className="w-full !py-3.5">
              {busy && <Spinner />}{last ? t.submitAnswers : t.nextQ}
            </Button>
          </div>
        )}
      </Page>
    </>
  );
}
