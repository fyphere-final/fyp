import { useParams, useSearchParams } from 'react-router-dom';
import { studentApi } from '../../api/endpoints';
import { t } from '../../lib/strings';
import QuizRunner from './QuizRunner';

/** Screen 9 - Re-assess: retry only the previously wrong questions (does not change recorded progress). */
export default function Reassess() {
  const { unitno, lessonNo } = useParams();
  const [sp] = useSearchParams();
  const attemptId = sp.get('attemptId');
  return (
    <QuizRunner key={`${unitno}-${lessonNo}-${attemptId}`} title={t.reassessTitle} banner
      load={() => studentApi.reassess(unitno, lessonNo, attemptId)}
      submit={(token, answers) => studentApi.reassessSubmit(unitno, lessonNo, token, answers)} />
  );
}
