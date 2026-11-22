import { Outlet } from 'react-router-dom';

/** Distraction-free wrapper for lesson flows (no bottom nav). RTL, Urdu UI. */
export default function LessonLayout() {
  return (
    <div dir="rtl" className="min-h-screen max-w-full overflow-x-hidden pb-[max(2rem,env(safe-area-inset-bottom))] font-ui">
      <Outlet />
    </div>
  );
}
