import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LessonLayout from './layouts/LessonLayout';
import Welcome from './features/auth/Welcome';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import UnitsPage from './features/dashboard/UnitsPage';
import Lessons from './features/lessons/Lessons';
import Sabaq from './features/sabaq/Sabaq';
import Exercise from './features/exercise/Exercise';
import Quiz from './features/quiz/Quiz';
import Result from './features/quiz/Result';
import Reassess from './features/quiz/Reassess';
import Progress from './features/progress/Progress';
import Profile from './features/profile/Profile';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/units" element={<UnitsPage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute><LessonLayout /></ProtectedRoute>}>
        <Route path="/units/:unitno/lessons" element={<Lessons />} />
        <Route path="/units/:unitno/lessons/:lessonNo/sabaq" element={<Sabaq />} />
        <Route path="/units/:unitno/lessons/:lessonNo/exercise" element={<Exercise />} />
        <Route path="/units/:unitno/lessons/:lessonNo/quiz" element={<Quiz />} />
        <Route path="/units/:unitno/lessons/:lessonNo/reassess" element={<Reassess />} />
        <Route path="/results/:attemptId" element={<Result />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
