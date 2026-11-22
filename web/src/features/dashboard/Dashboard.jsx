import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { pctUrdu } from '../../lib/format';
import { EmptyState, ErrorState, Page, ProgressBar, Skeleton, SkeletonList } from '../../components/ui';
import UnitList from './UnitList';

/** Screen 3 - Student Dashboard. */
export default function Dashboard() {
  const { logout } = useAuth();
  const { data, error, loading, reload } = useAsync(studentApi.dashboard, []);
  const initial = data?.student?.name?.trim()?.[0] ?? '';

  return (
    <>
      <header className="rounded-b-[36px] bg-maroon text-white lg:rounded-none">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-between gap-4 px-5 pb-[55px] pt-[39px] sm:px-6 lg:px-8 lg:pb-16 lg:pt-10">
          <div className="min-w-0 flex-1">
            <p className="ui-text text-[12.8px] leading-[18px] text-gold-soft">{t.greeting}</p>
            {loading ? <Skeleton className="mt-1 h-9 w-40 !bg-white/15" /> : (
              <h1 className="ui-text mt-[5px] break-words text-[27.5px] font-medium leading-[38px]">{data?.student?.name}</h1>
            )}
            <p className="ui-text mt-2 text-[12.7px] leading-[18px] text-gold-soft/90">{t.todayWord}</p>
          </div>
          <div className="flex w-[60px] shrink-0 flex-col items-center gap-1.5 lg:hidden">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold font-ui text-[20px] font-bold text-maroon">{initial || '·'}</span>
            <button type="button" onClick={logout} className="ui-text -my-3.5 inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap text-[10.5px] font-bold leading-4 text-gold-soft">
              <LogOut size={12} /> {t.logout}
            </button>
          </div>
        </div>
      </header>

      <Page className="!pt-0 -mt-[6px]">
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : (
          <div className="fade-in">
            {loading ? <Skeleton className="h-[197px] !rounded-[24px]" /> : data.resume && (
              <section className="rounded-[24px] bg-white px-5 pb-5 pt-[25px] shadow-soft lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-8">
                <div className="min-w-0">
                  <p className="ui-text text-[11.7px] font-bold leading-4 text-label">{t.continueLearning}</p>
                  <h2 className="ui-text mt-[7px] break-words text-[18px] font-medium leading-7 text-ink">{data.resume.unitTitle}</h2>
                  <p className="urdu text-[15px] leading-[34px] text-ink-soft">{data.resume.lessonTitle}</p>
                  <ProgressBar value={data.overallPercent} className="mt-2" />
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 lg:mt-0 lg:flex-col lg:items-stretch">
                  <span className="ui-text text-[12.6px] text-ink-soft">{pctUrdu(data.overallPercent)} {t.complete}</span>
                  <Link to={`/units/${data.resume.unitno}/lessons/${data.resume.lessonNo}/sabaq`} className="-my-[3.5px] inline-flex min-h-[44px] items-center">
                    <span className="ui-text inline-flex h-[37px] min-w-[96px] items-center justify-center rounded-xl bg-maroon px-4 text-[11.8px] font-bold text-white shadow-btn">{t.openLesson}</span>
                  </Link>
                </div>
              </section>
            )}

            <section className="mt-[33px]">
              <div className="mb-[13px] flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="ui-text text-[11.7px] font-bold leading-4 text-label">{t.myLearning}</p>
                  <h2 className="ui-text text-[20px] leading-9">{t.units}</h2>
                </div>
                <Link to="/units" className="ui-text inline-flex min-h-[44px] items-center px-1 text-[11.8px] font-bold text-ink">{t.seeAll}</Link>
              </div>
              {loading ? <SkeletonList rows={3} className="h-[102px] !rounded-[18px]" /> : data.units.length ? <UnitList units={data.units} /> : <EmptyState message={t.emptyUnits} />}
            </section>
          </div>
        )}
      </Page>
    </>
  );
}
