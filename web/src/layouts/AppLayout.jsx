import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, BookOpen, Home, LogOut } from 'lucide-react';
import { t } from '../lib/strings';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/Brand';

const items = [
  { to: '/dashboard', label: t.nav.home, icon: Home },
  { to: '/units', label: t.nav.units, icon: BookOpen },
  { to: '/progress', label: t.nav.progress, icon: BarChart3 },
];

/**
 * Mobile/tablet: content + fixed bottom tab bar.
 * Desktop (lg+): fixed right-hand rail (RTL start side) + content.
 */
export default function AppLayout() {
  const { logout } = useAuth();
  return (
    <div dir="rtl" className="min-h-screen max-w-full overflow-x-hidden font-ui lg:pe-64">
      <aside className="fixed inset-y-0 end-0 z-30 hidden w-64 flex-col border-s border-cream-line bg-white p-5 lg:flex">
        <div className="mb-8 mt-2 flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <span className="font-sans text-xl font-bold text-maroon" dir="ltr">Obaid Qaida</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex min-h-tap items-center gap-3 rounded-xl px-4 py-2.5 font-bold transition ${isActive ? 'bg-maroon text-white shadow-btn' : 'text-ink-soft hover:bg-cream-deep'}`}>
              <Icon size={20} /> <span className="ui-text">{label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={logout} className="flex min-h-tap items-center gap-3 rounded-xl px-4 py-2.5 font-bold text-ink-soft hover:bg-cream-deep">
          <LogOut size={20} /> <span className="ui-text">{t.logout}</span>
        </button>
      </aside>

      <div className="min-w-0 pb-24 lg:pb-0"><Outlet /></div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="main">
        <ul className="mx-auto grid max-w-xl grid-cols-3">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to} className="min-w-0">
              <NavLink to={to}
                className={({ isActive }) => `flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-xs font-bold ${isActive ? 'text-maroon' : 'text-ink-soft'}`}>
                <Icon size={22} /> <span className="ui-text truncate leading-snug">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
