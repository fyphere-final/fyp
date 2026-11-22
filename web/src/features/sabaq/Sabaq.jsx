import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage, errorStatus } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { suggest } from '../../lib/roman';
import { t } from '../../lib/strings';
import { num } from '../../lib/format';
import { Button, ErrorState, Page, PageHeader, Skeleton, Spinner } from '../../components/ui';

function WordRow({ w, index, value, onChange, onFocus, result, suggestions, onPick, active }) {
  const state = result ? (result.correct ? 'ok' : 'bad') : null;
  return (
    <li className="min-w-0 border-b border-cream-track py-[15px] last:border-b-0">
      <div className="flex min-w-0 flex-wrap items-center gap-x-[14px] gap-y-2">
        <div className="flex min-w-[100px] max-w-full shrink-0 items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-deep font-sans text-[11px] font-bold text-maroon">{num(index + 1)}</span>
          <span className="arabic !py-0 text-[21px] !leading-[44px] text-ink" lang="ar" dir="rtl">{w.word}</span>
        </div>
        <div className="min-w-[10.5rem] flex-1">
          {w.meaningMissing ? (
            <p className="ui-text rounded-[14px] bg-cream-deep px-4 py-2.5 text-[11.5px] text-ink-soft">{t.meaningMissing}</p>
          ) : (
            <input
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              onFocus={onFocus}
              aria-label={w.word} dir="auto"
              autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
              className={`field ui-text !min-h-[44px] ${state === 'ok' ? '!border-ok !bg-ok-soft' : ''} ${state === 'bad' ? '!border-bad !bg-bad-soft' : ''}`}
            />
          )}
        </div>
      </div>
      {active && suggestions.length > 0 && (
        <div className="fade-in mt-2 rounded-[14px] bg-cream-deep p-[14px]">
          <p className="ui-text mb-1.5 text-[10px] font-bold leading-4 text-ink-soft">{t.urduSuggest}</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(s)} className="-my-2 inline-flex min-h-[44px] items-center">
                <span className="ui-text inline-flex h-[30px] items-center rounded-full border-[1.5px] border-gold-soft bg-white px-3.5 text-[14px] font-bold text-ink">{s}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {result && (
        <p className={`ui-text mt-2 flex items-center gap-2 text-[12px] font-bold ${result.correct ? 'text-ok' : 'text-bad'}`}>
          {result.correct ? <Check size={15} /> : <X size={15} />}
          {result.correct ? t.right : <>{t.correctAnswer}: <span className="text-[13px]">{result.meaning}</span></>}
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
  const practice = data?.words.filter((w) => !w.meaningMissing) ?? [];
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
  const checked = Object.values(results ?? {});
  return (
    <>
      <PageHeader subtitle={data ? `${data.unitTitle} · ${t.unit} ${num(unitno)}` : ''} title={`${t.lesson} ${num(lessonNo)}`} backTo={lessonsUrl} />
      <Page className="max-w-4xl !pt-[27px]">
        {error ? <ErrorState message={errorMessage(error)} onRetry={blocked ? () => nav(lessonsUrl) : reload} />
        : loading ? <div className="space-y-4"><Skeleton className="h-[156px] !rounded-[22px]" /><Skeleton className="h-72 !rounded-[22px]" /></div> : (
          <div className="fade-in space-y-5">
            <section className="rounded-[22px] border border-[#EBDCC3] bg-cream-deep p-[22px]">
              <h2 className="ui-text text-[21px] font-bold leading-8 text-ink">{t.sabaqIntroTitle}</h2>
              <p className="ui-text mt-[9px] text-[12.2px] font-medium leading-[23.5px] text-ink">{t.sabaqIntro}</p>
            </section>

            <section className="card px-[15px] py-[3px]">
              {data.words.length === 0 ? <p className="ui-text py-6 text-center text-ink-soft">{t.emptyUnits}</p> : (
                <ul>
                  {data.words.map((w, i) => (
                    <WordRow key={w.wno} w={w} index={i}
                      value={typed[w.wno]} onChange={(v) => { setTyped((s) => ({ ...s, [w.wno]: v })); setResults(null); }}
                      onFocus={() => setFocus(w.wno)}
                      active={focus === w.wno}
                      suggestions={focus === w.wno ? suggest(typed[w.wno] ?? '', meanings) : []}
                      onPick={(s) => { setTyped((st) => ({ ...st, [w.wno]: s })); setResults(null); }}
                      result={results?.[w.wno]} />
                  ))}
                </ul>
              )}
            </section>

            <p className="ui-text rounded-[18px] border-e-[3px] border-gold bg-cream-deep px-4 py-[14px] text-[12.4px] font-semibold leading-[23px] text-ink">{t.sabaqTip}</p>

            {results && checked.length > 0 && (
              <p className="ui-text rounded-xl bg-maroon-soft px-4 py-3 text-center text-[12.5px] font-bold text-maroon">
                {t.correctCount(num(checked.filter((r) => r.correct).length), num(checked.length))}
              </p>
            )}
            {msg && <p role="alert" className="ui-text rounded-xl bg-bad-soft px-4 py-3 text-[12.5px] text-bad">{msg}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              {!results && practice.length > 0 && <Button onClick={onCheck} disabled={busy} className="sm:flex-1">{busy && <Spinner />}{t.check}</Button>}
              {(results || practice.length === 0) && (
                <>
                  {practice.length > 0 && <Button variant="outline" onClick={onCheck} disabled={busy} className="sm:flex-1">{t.check}</Button>}
                  <Button onClick={onNext} disabled={busy} className="sm:flex-1">{busy && <Spinner />}{t.toMashq}</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Page>
    </>
  );
}
