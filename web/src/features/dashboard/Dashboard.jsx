import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { pct, urduNum } from '../../lib/format';
import { EmptyState, ErrorState, Page, ProgressBar, Skeleton, SkeletonList } from '../../components/ui';
import UnitList from './UnitList';

/** Screen 3 - Student Dashboard. */
export default function Dashboard() {
  const { logout } = useAuth();
  const { data, error, loading, reload } = useAsync(studentApi.dashboard, []);
  const initial = data?.student?.name?.trim()?.[0] ?? '';

  return (
    <>
      <header className="rounded-b-[2.25rem] bg-maroon text-white lg:rounded-none">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-5 pb-14 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 lg:pb-16 lg:pt-10">
          <div className="min-w-0 flex-1">
            <p className="ui-text text-sm text-gold-soft">{t.greeting}</p>
            {loading ? <Skeleton className="mt-2 h-10 w-40 !bg-white/15" /> : (
              <h1 className="urdu break-words text-3xl font-bold sm:text-4xl">{data?.student?.name}</h1>
            )}
            <p className="urdu mt-1 text-sm text-gold-soft sm:text-base">{t.todayWord}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1 lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold font-ui text-lg font-bold text-maroon-dark">{initial || '·'}</span>
            <button type="button" onClick={logout} className="ui-text inline-flex min-h-tap items-center gap-1 px-1 text-xs font-bold text-gold-soft">
              <LogOut size={14} /> {t.logout}
            </button>
          </div>
        </div>
      </header>

      <Page className="-mt-9 lg:-mt-10">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : (
          <div className="fade-in space-y-8">
            {loading ? <Skeleton className="h-44" /> : data.resume && (
              <section className="card p-5 sm:p-6 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                <div className="min-w-0">
                  <p className="ui-text text-xs font-bold text-maroon">{t.continueLearning}</p>
                  <h2 className="ui-text mt-1 break-words text-lg font-bold sm:text-xl">{data.resume.unitTitle}</h2>
                  <p className="urdu mt-1 text-xl text-maroon sm:text-2xl">{data.resume.lessonTitle}</p>
                  <ProgressBar value={data.overallPercent} thick className="mt-3" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 lg:mt-0 lg:flex-col lg:items-stretch">
                  <span className="ui-text text-sm text-ink-soft">{pct(data.overallPercent)} {t.complete}</span>
                  <Link to={`/units/${data.resume.unitno}/lessons/${data.resume.lessonNo}/sabaq`} className="btn btn-primary">{t.openLesson}</Link>
                </div>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="ui-text text-xs font-bold text-ink-soft">{t.myLearning}</p>
                  <h2 className="urdu text-2xl">{t.units}</h2>
                </div>
                <Link to="/units" className="ui-text inline-flex min-h-tap items-center px-1 text-sm font-bold text-maroon">{t.seeAll}</Link>
              </div>
              {loading ? <SkeletonList rows={3} /> : data.units.length ? <UnitList units={data.units} /> : <EmptyState message={t.emptyUnits} />}
            </section>
          </div>
        )}
      </Page>
    </>
  );
}
