import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandMark } from '../../components/Brand';

/** Screen 1 - Welcome / Splash (English, LTR - matches mockup). */
export default function Welcome() {
  const { user } = useAuth();
  if (user?.role === 'student') return <Navigate to="/dashboard" replace />;

  return (
    <div dir="ltr" className="relative flex min-h-screen max-w-full items-center justify-center overflow-hidden bg-maroon px-6 text-white">
      {/* decorative rings */}
      <div aria-hidden className="pointer-events-none absolute -left-[80px] -top-[135px] h-[290px] w-[290px] rounded-full border border-gold/25" />
      <div aria-hidden className="pointer-events-none absolute -bottom-[175px] -right-[110px] h-[344px] w-[344px] rounded-full border border-gold/25" />
      {/* arch frame: inset 24, semicircular top, 26px bottom corners */}
      <div aria-hidden className="pointer-events-none absolute bottom-6 left-6 right-6 top-8 mx-auto max-w-[345px] rounded-b-[26px] rounded-t-[172px] border border-gold/30" />

      <main className="fade-in relative z-10 flex w-full max-w-[345px] flex-col items-center text-center">
        <BrandMark />
        <p className="mt-[25px] text-[13.7px] leading-5 text-gold-soft">A simple journey to understanding the Quran</p>
        <h1 className="mt-[11px] break-words text-[47px] font-bold leading-[56px]">Obaid Qaida</h1>
        <p className="mt-4 max-w-[340px] text-[14.6px] leading-[29.5px] text-cream">
          Learn Quranic vocabulary through simple lessons, meaningful exercises, and short quizzes.
        </p>
        <Link to="/login" className="btn btn-gold mt-[30px] !h-[47px] w-[331px] max-w-full !rounded-2xl !text-[13.8px]">Start Learning</Link>
        <p className="mt-5 text-[12.5px] leading-5 text-cream-deep/80">Learn · Practice · Progress</p>
      </main>
    </div>
  );
}
