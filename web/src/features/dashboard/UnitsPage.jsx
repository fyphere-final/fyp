import { studentApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import { useAsync } from '../../lib/useAsync';
import { t } from '../../lib/strings';
import { EmptyState, ErrorState, Page, PageHeader, SkeletonList } from '../../components/ui';
import UnitList from './UnitList';

/** "یونٹس" tab - full unit list (section overview of Screen 3). */
export default function UnitsPage() {
  const { data, error, loading, reload } = useAsync(studentApi.units, []);
  return (
    <>
      <PageHeader subtitle={t.myLearning} title={t.units} />
      <Page>
        {error ? <ErrorState message={errorMessage(error)} onRetry={reload} /> : loading ? <SkeletonList rows={3} /> :
          data.units.length ? <div className="fade-in"><UnitList units={data.units} /></div> : <EmptyState message={t.emptyUnits} />}
      </Page>
    </>
  );
}
