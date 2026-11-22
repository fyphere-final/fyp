import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './ui';

export default function ProtectedRoute({ children }) {
  const { user, booting } = useAuth();
  const loc = useLocation();
  if (booting) {
    return <div className="flex min-h-screen items-center justify-center text-maroon"><Spinner className="h-8 w-8" /></div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (user.role !== 'student') return <Navigate to="/login" replace state={{ teacherNotice: true }} />;
  return children;
}
