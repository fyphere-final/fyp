import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../../components/Brand';

/** Screen 1 - Welcome / Splash (English, LTR - matches mockup). */
export default function Welcome() {
  const { user } = useAuth();
  if (user?.role === 'student') return <Navigate to="/dashboard" replace />;

  return (
    <div dir="ltr" className="relative flex min-h-screen max-w-full items-center justify-center overflow-hidden bg-maroon px-5 py-10 text-white">
      {/* decorative rings */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full border border-gold/25 sm:h-96 sm:w-96" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full border border-gold/25 sm:h-[28rem] sm:w-[28rem]" />
      {/* arch frame */}
      <div aria-hidden className="pointer-events-none absolute inset-4 rounded-t-[999px] rounded-b-3xl border border-gold/25 sm:inset-8 lg:inset-y-8 lg:left-1/2 lg:right-auto lg:w-[34rem] lg:-translate-x-1/2" />

      <main className="fade-in relative z-10 flex w-full max-w-md flex-col items-center px-3 text-center sm:max-w-lg">
        <BrandMark className="h-20 w-20 sm:h-24 sm:w-24" />
        <p className="mt-8 text-sm text-gold-soft sm:text-base">A simple journey to understanding the Quran</p>
        <h1 className="mt-3 break-words text-5xl font-bold leading-tight tracking-tight sm:text-6xl">Obaid Qaida</h1>
        <p className="mt-5 max-w-sm text-base leading-relaxed text-white/90 sm:text-lg">
          Learn Quranic vocabulary through simple lessons, meaningful exercises, and short quizzes.
        </p>
        <Link to="/login" className="btn btn-gold mt-9 w-full max-w-sm !rounded-2xl !py-4 !text-base">
          Start Learning
        </Link>
        <p className="mt-6 text-sm text-gold-soft/90">Learn · Practice · Progress</p>
      </main>
    </div>
  );
}
