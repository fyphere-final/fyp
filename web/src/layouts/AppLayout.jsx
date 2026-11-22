import { NavLink, Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ChartIcon, HomeIcon, ProfileIcon, UnitsIcon } from '../components/NavIcons';
import { t } from '../lib/strings';
import { useAuth } from '../context/AuthContext';
import { BrandMark } from '../components/Brand';

const items = [
  { to: '/dashboard', label: t.nav.home, icon: HomeIcon },
  { to: '/units', label: t.nav.units, icon: UnitsIcon },
  { to: '/progress', label: t.nav.progress, icon: ChartIcon },
  { to: '/profile', label: t.nav.profile, icon: ProfileIcon },
];

/**
 * Mobile/tablet: content + fixed 66px bottom tab bar (as in the mockups).
 * Desktop (lg+): fixed right-hand rail (RTL start side) + content.
 */
export default function AppLayout() {
  const { logout } = useAuth();
  return (
    <div dir="rtl" className="min-h-screen max-w-full overflow-x-hidden font-ui lg:pe-64">
      <aside className="fixed inset-y-0 end-0 z-30 hidden w-64 flex-col border-s border-cream-track bg-white p-5 lg:flex">
        <div className="mb-8 mt-2 flex items-center gap-3">
          <BrandMark className="h-11 w-11" />
          <span className="font-sans text-xl font-bold text-maroon" dir="ltr">Obaid Qaida</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `flex min-h-[47px] items-center gap-3 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition ${isActive ? 'bg-maroon text-white shadow-btn' : 'text-ink-soft hover:bg-cream-deep'}`}>
              <span className="flex w-5 justify-center"><Icon /></span> <span className="ui-text">{label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={logout} className="flex min-h-[47px] items-center gap-3 rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-ink-soft hover:bg-cream-deep">
          <LogOut size={20} /> <span className="ui-text">{t.logout}</span>
        </button>
      </aside>

      <div className="min-w-0 pb-[84px] lg:pb-0"><Outlet /></div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-track bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="main">
        <ul className="mx-auto grid max-w-xl grid-cols-4">
          {items.map(({ to, label, icon: Icon }) => (
            <li key={to} className="min-w-0">
              <NavLink to={to}
                className={({ isActive }) => `flex h-[66px] flex-col items-center px-1 pt-[5px] ${isActive ? 'font-bold text-maroon' : 'text-ink-nav'}`}>
                <span className="flex h-6 items-center"><Icon /></span> <span className="ui-text truncate text-[10.5px] leading-4">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
