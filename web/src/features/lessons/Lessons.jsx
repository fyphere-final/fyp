import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookOpen, BarChart3, ChevronDown, Lock, Plus } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage, errorStatus } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { num } from '../../lib/format';
import { EmptyState, ErrorState, NumBadge, Page, PageHeader, SkeletonList } from '../../components/ui';

function Action({ to, icon: Icon, label, sub }) {
  return (
    <Link to={to} className="flex h-[75px] min-w-0 flex-1 flex-col items-center justify-center rounded-2xl border border-gold-soft bg-cream px-1 text-maroon transition hover:border-gold">
      <Icon size={20} strokeWidth={1.8} />
      <span className="ui-text mt-1 text-[12.4px] font-bold leading-[18px] text-ink">{label}</span>
      <span className="ui-text text-[10px] leading-[14px] text-ink-soft">{sub}</span>
    </Link>
  );
}

function LessonCard({ lesson, base, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const locked = lesson.locked;

  if (locked) {
    return (
      <div aria-disabled className="flex min-w-0 items-center gap-[13px] rounded-[20px] border border-[#F3E7D6] bg-[#FDF7EE] px-[15px] py-[12px]">
        <NumBadge locked />
        <div className="min-w-0 flex-1 text-start">
          <p className="ui-text text-[10px] font-bold leading-4 text-[#BFA9A4]">{t.lesson} {num(lesson.lessonNo)}</p>
          <h3 className="urdu text-[15px] font-medium leading-[32px] text-[#B8A09B]">{lesson.title}</h3>
          <p className="ui-text text-[10.7px] leading-4 text-[#BFA9A4]">{lesson.unavailable ? t.unavailable : t.lessonUnlockHint}</p>
        </div>
        <Lock size={15} className="shrink-0 text-[#C9B3AC]" />
      </div>
    );
  }
  return (
    <div className="min-w-0 rounded-[20px] border border-cream-track bg-white px-[15px] pb-3 pt-[15px] shadow-soft">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex min-h-[60px] w-full min-w-0 items-center gap-[13px]">
        <NumBadge>{num(lesson.lessonNo)}</NumBadge>
        <div className="min-w-0 flex-1 text-start">
          <p className="ui-text text-[10px] font-bold leading-4 text-ink-soft">{t.lesson} {num(lesson.lessonNo)}</p>
          <h3 className="urdu !py-0 mt-0.5 text-[15px] font-bold !leading-7 text-ink">{lesson.title}</h3>
          <p className="ui-text text-[10.7px] leading-[14px] text-ink-soft">
            {num(lesson.wordCount)} الفاظ
            {lesson.quizBestPct != null && <> · {t.jaiza} {num(lesson.quizBestPct)}%</>}
            {lesson.completed && <> · ✓</>}
          </p>
        </div>
        <ChevronDown size={18} className={`shrink-0 text-ink-soft transition ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="fade-in mt-[15px] flex gap-2">
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
      <PageHeader subtitle={`${t.unit} ${num(unitno)}`} title={data?.unit.title ?? t.loading} backTo="/dashboard" />
      <Page className="!pt-8">
        <div className="mb-[26px]">
          <h2 className="ui-text text-[24px] font-normal leading-9">{t.unitLessonsTitle}</h2>
          <p className="ui-text mt-[5px] text-[12.7px] font-semibold leading-5 text-ink-soft">{t.unitLessonsHint}</p>
        </div>
        {error ? (
          <ErrorState message={errorStatus(error) === 404 ? 'Unit not found' : errorMessage(error)} onRetry={reload} />
        ) : loading ? <SkeletonList rows={4} className="h-[90px] !rounded-[20px]" /> : !data.lessons.length ? <EmptyState message={t.emptyUnits} /> : (
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
