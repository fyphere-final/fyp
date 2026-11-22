import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, BarChart3, ChevronDown, Plus } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage, errorStatus } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { urduNum } from '../../lib/format';
import { EmptyState, ErrorState, LockBadge, Page, PageHeader, SkeletonList } from '../../components/ui';

function Action({ to, icon: Icon, label, sub }) {
  return (
    <Link to={to} className="flex min-h-[4.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl border border-cream-line bg-white px-2 py-2 text-maroon transition hover:border-gold hover:bg-cream">
      <Icon size={20} />
      <span className="ui-text text-sm font-bold leading-snug">{label}</span>
      <span className="ui-text text-[0.7rem] leading-snug text-ink-soft">{sub}</span>
    </Link>
  );
}

function LessonCard({ lesson, base, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const locked = lesson.locked;
  const head = (
    <>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-ui text-lg font-bold ${locked ? 'bg-cream-deep text-ink-soft/60' : 'bg-cream-deep text-maroon'}`}>
        {locked ? <LockBadge className="!h-auto !w-auto !bg-transparent" /> : urduNum(lesson.lessonNo)}
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p className="ui-text text-xs font-bold text-ink-soft">{t.lesson} {urduNum(lesson.lessonNo)}</p>
        <h3 className={`urdu text-xl font-bold ${locked ? 'text-ink-soft' : 'text-maroon-dark'}`}>{lesson.title}</h3>
        <p className="ui-text mt-1 text-xs text-ink-soft">
          {lesson.unavailable ? t.unavailable : locked ? t.lessonUnlockHint : (
            <>
              {urduNum(lesson.wordCount)} الفاظ
              {lesson.quizBestPct != null && <> · {t.jaiza} {urduNum(lesson.quizBestPct)}٪</>}
              {lesson.completed && <> · ✓ {t.complete}</>}
            </>
          )}
        </p>
      </div>
    </>
  );
  if (locked) {
    return <div aria-disabled className="flex min-w-0 items-center gap-3 rounded-2xl border border-cream-line/70 bg-cream-deep/40 p-4 opacity-70">{head}</div>;
  }
  return (
    <div className="card min-w-0 p-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-tap w-full min-w-0 items-center gap-3">
        {head}
        <ChevronDown size={20} className={`shrink-0 text-ink-soft transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="fade-in mt-4 flex gap-2.5">
          <Action to={`${base}/sabaq`} icon={BookOpen} label={t.sabaq} sub={t.sabaqSub} />
          <Action to={`${base}/exercise`} icon={BarChart3} label={t.mashq} sub={t.mashqSub} />
          <Action to={`${base}/quiz`} icon={Plus} label={t.jaiza} sub={t.jaizaSub} />
        </div>
      )}
    </div>
  );
}

/** Screen 4 - Lessons list with unlocked / locked progression. */
export default function Lessons() {
  const { unitno } = useParams();
  const { data, error, loading, reload } = useAsync(() => studentApi.unitLessons(unitno), [unitno]);
  const firstOpen = data?.lessons.find((l) => !l.locked && !l.completed) ?? data?.lessons.find((l) => !l.locked);

  return (
    <>
      <PageHeader subtitle={`${t.unit} ${urduNum(unitno)}`} title={data?.unit.title ?? t.loading} backTo="/dashboard" />
      <Page>
        <div className="mb-5">
          <h2 className="urdu text-2xl sm:text-3xl">{t.unitLessonsTitle}</h2>
          <p className="ui-text mt-2 text-sm text-ink-soft">{t.unitLessonsHint}</p>
        </div>
        {error ? (
          <ErrorState message={errorStatus(error) === 404 ? 'Unit not found' : errorMessage(error)} onRetry={reload} />
        ) : loading ? <SkeletonList rows={4} className="h-24" /> : !data.lessons.length ? <EmptyState message={t.emptyUnits} /> : (
          <div className="fade-in grid min-w-0 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.lessons.map((l) => (
              <LessonCard key={l.lessonNo} lesson={l} base={`/units/${unitno}/lessons/${l.lessonNo}`} defaultOpen={l === firstOpen} />
            ))}
          </div>
        )}
      </Page>
    </>
  );
}
