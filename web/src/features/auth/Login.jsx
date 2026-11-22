import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { errorMessage, errorStatus } from '../../api/client';
import { BrandMark } from '../../components/Brand';
import { Spinner } from '../../components/ui';

/** Screen 2 - Login. Role-aware (student/teacher); only the student flow is built in Phase 1. */
export default function Login() {
  const { user, login, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(loc.state?.teacherNotice ? 'The teacher dashboard is coming soon. Please sign in with a student account.' : '');

  if (user?.role === 'student') return <Navigate to={loc.state?.from || '/dashboard'} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Please enter your Gmail account and password.');
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      if (u.role !== 'student') {
        logout();
        setError('The teacher dashboard is coming soon. Please sign in with a student account.');
      } else {
        nav(loc.state?.from || '/dashboard', { replace: true });
      }
    } catch (err) {
      setError(errorStatus(err) === 400 ? 'Please enter a valid Gmail address.' : errorMessage(err, 'Sign in failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir="ltr" className="min-h-screen max-w-full overflow-x-hidden bg-cream lg:grid lg:grid-cols-2">
      <header className="bg-maroon px-5 pb-6 pt-[max(1.25rem,env(safe-area-inset-top))] text-white sm:px-8 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="mx-auto flex w-full max-w-md items-start justify-between gap-3 lg:mx-0 lg:max-w-none">
          <div className="min-w-0">
            <p className="text-sm text-gold-soft">Obaid Qaida</p>
            <h1 className="mt-0.5 text-2xl font-bold sm:text-3xl">Welcome</h1>
          </div>
          <Link to="/" aria-label="Back" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 hover:bg-white/20">
            <ChevronLeft size={22} />
          </Link>
        </div>
        <div className="hidden max-w-sm lg:block">
          <BrandMark className="h-20 w-20" />
          <p className="mt-6 text-4xl font-bold leading-tight">Obaid Qaida</p>
          <p className="mt-3 text-lg text-white/85">Learn Quranic vocabulary through simple lessons, meaningful exercises, and short quizzes.</p>
        </div>
        <span className="hidden lg:block" />
      </header>

      <main className="px-5 py-8 sm:px-8 lg:flex lg:items-center lg:justify-center lg:px-12">
        <div className="fade-in mx-auto w-full max-w-md">
          <p className="text-sm font-bold text-maroon">Obaid Qaida</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight">Sign in to your account</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">We will automatically open the correct dashboard for your Gmail account.</p>

          <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold">Gmail account</label>
              <input id="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
                value={email} onChange={(e) => setEmail(e.target.value)} className="input !rounded-2xl !py-3.5" />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold">Password</label>
              <div className="relative">
                <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)} className="input !rounded-2xl !py-3.5 pr-12" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}
                  className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-ink-soft">
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-sm text-bad">{error}</p>}

            <button type="submit" disabled={busy} className="btn btn-primary !rounded-2xl !px-8 !py-3.5">
              {busy && <Spinner />} Sign In
            </button>
          </form>

          <div className="mt-8 rounded-2xl bg-cream-deep px-4 py-4 text-center">
            <p className="text-sm font-bold text-maroon">Demo Accounts</p>
            <p className="mt-2 break-all text-sm text-ink-soft">student@gmail.com</p>
            <p className="break-all text-sm text-ink-soft">teacher@gmail.com</p>
            <p className="mt-1 text-xs text-ink-soft/80">Password: 123456</p>
          </div>
        </div>
      </main>
    </div>
  );
}
