import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
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
      <header className="relative bg-maroon text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="px-5 pb-[26px] pt-6 lg:p-0">
          <p className="text-[11.6px] leading-4 text-gold-soft">Obaid Qaida</p>
          <h1 className="mt-[5px] text-[20.6px] font-bold leading-[30px] lg:text-3xl">Welcome</h1>
        </div>
        <Link to="/" aria-label="Back" className="group absolute right-[19px] top-[28.5px] inline-flex h-11 w-11 items-center justify-center lg:right-8 lg:top-8">
          <span className="inline-flex h-[41px] w-[41px] items-center justify-center rounded-xl border border-white/[0.28] bg-white/10 group-hover:bg-white/20"><ChevronLeft size={20} /></span>
        </Link>
        <div className="hidden max-w-sm lg:block">
          <BrandMark className="h-20 w-20" />
          <p className="mt-6 text-4xl font-bold leading-tight">Obaid Qaida</p>
          <p className="mt-3 text-lg text-white/85">Learn Quranic vocabulary through simple lessons, meaningful exercises, and short quizzes.</p>
        </div>
        <span className="hidden lg:block" />
      </header>

      <main className="px-4 pb-10 pt-[28px] lg:flex lg:items-center lg:justify-center lg:px-12">
        <div className="fade-in mx-auto w-full max-w-md">
          <p className="text-[11.7px] font-bold leading-[18px] text-label">Obaid Qaida</p>
          <h2 className="mt-[7px] text-[24.3px] font-normal leading-[34px]">Sign in to your account</h2>
          <p className="mt-[6.5px] text-[12.7px] leading-[22.5px] text-ink-soft">We will automatically open the correct dashboard for your Gmail account.</p>

          <form onSubmit={onSubmit} noValidate className="mt-[23.5px]">
            <label htmlFor="email" className="mb-[7px] block text-[12.6px] font-bold leading-5">Gmail account</label>
            <input id="email" type="email" inputMode="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
              value={email} onChange={(e) => setEmail(e.target.value)} className="field !min-h-[48px] !rounded-[15px] !text-[14px]" />

            <label htmlFor="password" className="mb-[9px] mt-[14px] block text-[12.6px] font-bold leading-5">Password</label>
            <div className="relative">
              <input id="password" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)} className="field !min-h-[46px] !rounded-[15px] !text-[14px] !font-bold" />
            </div>

            {error && <p role="alert" className="mt-4 rounded-xl border border-bad/30 bg-bad-soft px-4 py-3 text-[12.5px] text-bad">{error}</p>}

            <button type="submit" disabled={busy} className="btn btn-primary mt-[16px] !min-h-[48px] !rounded-[15px] !px-[17px] !text-[13.7px]">
              {busy && <Spinner />} Sign In
            </button>
          </form>

          <div className="mt-[22px] rounded-2xl bg-cream-deep px-4 pb-3 pt-[11px] text-center">
            <p className="text-[11.7px] font-bold leading-[18px] text-maroon">Demo Accounts</p>
            <p className="mt-[5.5px] break-all text-[11.6px] leading-[17px] text-ink-soft">student@gmail.com</p>
            <p className="break-all text-[11.6px] leading-[17px] text-ink-soft">teacher@gmail.com</p>
            <p className="mt-[5px] text-[9.5px] leading-4 text-ink-soft">Password: 123456</p>
          </div>
        </div>
      </main>
    </div>
  );
}
