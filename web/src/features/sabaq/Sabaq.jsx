import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage, errorStatus } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { suggest } from '../../lib/roman';
import { t } from '../../lib/strings';
import { urduNum } from '../../lib/format';
import { Button, ErrorState, Page, PageHeader, Skeleton, Spinner } from '../../components/ui';

function WordRow({ w, index, value, onChange, onFocus, result, suggestions, onPick, active }) {
  const readOnly = w.example || w.meaningMissing;
  const state = result ? (result.correct ? 'ok' : 'bad') : null;
  return (
    <li className="min-w-0 py-4">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex min-w-0 max-w-full shrink-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-deep font-ui text-xs font-bold text-maroon">{urduNum(index + 1)}</span>
          <span className="arabic text-3xl text-maroon-dark sm:text-4xl" lang="ar" dir="rtl">{w.word}</span>
        </div>
        <div className="min-w-[11rem] flex-1">
          {w.meaningMissing ? (
            <p className="ui-text rounded-xl bg-cream-deep px-4 py-2.5 text-sm text-ink-soft">{t.meaningMissing}</p>
          ) : (
            <div className="relative">
              <input
                value={readOnly ? w.meaning : value ?? ''}
                readOnly={readOnly}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                aria-label={`${t.typeMeaning}: ${w.word}`}
                placeholder={t.typeMeaning}
                autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
                className={`input urdu !py-1 text-lg ${readOnly ? '!bg-cream-deep/60 text-ink-soft' : ''} ${state === 'ok' ? '!border-ok !bg-ok-soft' : ''} ${state === 'bad' ? '!border-bad !bg-bad-soft' : ''}`}
              />
              {w.example && <span className="ui-text pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[0.7rem] font-bold text-gold-dark">{t.example}</span>}
            </div>
          )}
        </div>
      </div>
      {active && suggestions.length > 0 && (
        <div className="fade-in mt-2 rounded-xl bg-cream-deep p-3">
          <p className="ui-text mb-2 text-xs text-ink-soft">{t.urduSuggest}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(s)}
                className="urdu min-h-tap rounded-full border border-gold bg-white px-4 text-lg font-bold text-maroon">{s}</button>
            ))}
          </div>
        </div>
      )}
      {result && (
        <p className={`ui-text mt-2 flex items-center gap-2 text-sm font-bold ${result.correct ? 'text-ok' : 'text-bad'}`}>
          {result.correct ? <Check size={16} /> : <X size={16} />}
          {result.correct ? t.right : <>{t.correctAnswer}: <span className="urdu text-base">{result.meaning}</span></>}
        </p>
      )}
    </li>
  );
}

/** Screen 5 - Sabaq (lesson content): Arabic words with airab + typed Urdu meaning. */
export default function Sabaq() {
  const { unitno, lessonNo } = useParams();
  const nav = useNavigate();
  const { data, error, loading, reload } = useAsync(() => studentApi.sabaq(unitno, lessonNo), [unitno, lessonNo]);
  const [typed, setTyped] = useState({});
  const [focus, setFocus] = useState(null);
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const meanings = useMemo(() => (data ? data.words.map((w) => w.meaning) : []), [data]);
  const practice = data?.words.filter((w) => !w.example && !w.meaningMissing) ?? [];
  const lessonsUrl = `/units/${unitno}/lessons`;

  async function onCheck() {
    const answers = {};
    practice.forEach((w) => { if ((typed[w.wno] ?? '').trim()) answers[w.wno] = typed[w.wno].trim(); });
    if (!Object.keys(answers).length) return setMsg('پہلے کم از کم ایک لفظ کا مطلب لکھیں۔');
    setBusy(true); setMsg('');
    try { setResults((await studentApi.sabaqCheck(unitno, lessonNo, answers)).results); }
    catch (e) { setMsg(errorMessage(e)); } finally { setBusy(false); }
  }

  async function onNext() {
    setBusy(true); setMsg('');
    try { await studentApi.sabaqComplete(unitno, lessonNo); nav(`/units/${unitno}/lessons/${lessonNo}/exercise`); }
    catch (e) { setMsg(errorMessage(e)); setBusy(false); }
  }

  const blocked = errorStatus(error) === 403 || errorStatus(error) === 409;
  return (
    <>
      <PageHeader subtitle={data ? `${data.unitTitle} · ${t.unit} ${urduNum(unitno)}` : ''} title={`${t.lesson} ${urduNum(lessonNo)}`} backTo={lessonsUrl} />
      <Page className="max-w-4xl">
        {error ? <ErrorState message={blocked ? errorMessage(error) : errorMessage(error)} onRetry={blocked ? () => nav(lessonsUrl) : reload} />
        : loading ? <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-72" /></div> : (
          <div className="fade-in space-y-5">
            <section className="rounded-2xl border border-cream-line bg-cream-deep/70 p-5">
              <h2 className="urdu text-2xl font-bold">{t.sabaqIntroTitle}</h2>
              <p className="ui-text mt-1 text-sm leading-loose text-ink-soft">{t.sabaqIntro}</p>
            </section>

            <section className="card p-4 sm:p-6">
              {data.words.length === 0 ? <p className="ui-text py-6 text-center text-ink-soft">{t.emptyUnits}</p> : (
                <ul className="divide-y divide-cream-line">
                  {data.words.map((w, i) => (
                    <WordRow key={w.wno} w={w} index={i}
                      value={typed[w.wno]} onChange={(v) => { setTyped((s) => ({ ...s, [w.wno]: v })); setResults(null); }}
                      onFocus={() => setFocus(w.wno)}
                      active={focus === w.wno && !w.example}
                      suggestions={focus === w.wno ? suggest(typed[w.wno] ?? '', meanings) : []}
                      onPick={(s) => { setTyped((st) => ({ ...st, [w.wno]: s })); setResults(null); }}
                      result={results?.[w.wno]} />
                  ))}
                </ul>
              )}
            </section>

            <p className="ui-text rounded-2xl border-s-4 border-gold bg-white px-4 py-3 text-sm leading-loose shadow-card">{t.sabaqTip}</p>

            {results && (
              <p className="ui-text rounded-xl bg-maroon-soft px-4 py-3 text-center text-sm font-bold text-maroon">
                {t.correctCount(urduNum(Object.values(results).filter((r) => r.correct).length), urduNum(Object.keys(results).length))}
              </p>
            )}
            {msg && <p role="alert" className="ui-text rounded-xl bg-bad-soft px-4 py-3 text-sm text-bad">{msg}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              {practice.length > 0 && <Button variant={results ? 'outline' : 'primary'} onClick={onCheck} disabled={busy} className="sm:flex-1">{busy && !results && <Spinner />}{t.check}</Button>}
              <Button onClick={onNext} disabled={busy} className="sm:flex-1">{busy && <Spinner />}{t.toMashq}</Button>
            </div>
          </div>
        )}
      </Page>
    </>
  );
}
