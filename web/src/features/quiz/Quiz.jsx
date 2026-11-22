import { useParams } from 'react-router-dom';
import { studentApi } from '../../api/endpoints';
import { t } from '../../lib/strings';
import QuizRunner from './QuizRunner';

/** Screen 7 - Quiz (Jaiza): end-of-lesson assessment. */
export default function Quiz() {
  const { unitno, lessonNo } = useParams();
  return (
    <QuizRunner key={`${unitno}-${lessonNo}`} title={t.quizShort}
      load={() => studentApi.quiz(unitno, lessonNo)}
      submit={(token, answers) => studentApi.quizSubmit(unitno, lessonNo, token, answers)} />
  );
}
