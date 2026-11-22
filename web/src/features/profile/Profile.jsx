import { useAuth } from '../../context/AuthContext';
import { t } from '../../lib/strings';
import { Page, PageHeader } from '../../components/ui';

/**
 * Profile (bottom-bar tab). Layout follows the "میرا پروفائل" mockup:
 * avatar, name, e-mail, role line and an outlined sign-out button.
 */
export default function Profile() {
  const { user, logout } = useAuth();
  const initial = user?.name?.trim()?.[0] ?? '·';

  return (
    <>
      <PageHeader compact subtitle={t.profileStudent} title={t.profileTitle} backTo="/dashboard" />
      <Page className="max-w-xl !pt-[23px]">
        <div className="fade-in space-y-[18px]">
          <section className="rounded-[22px] border border-cream-track bg-white px-5 pb-[23px] pt-[26px] text-center shadow-card">
            <span className="mx-auto flex h-[63px] w-[63px] items-center justify-center rounded-full bg-gold font-ui text-[26px] font-bold text-maroon">{initial}</span>
            <h2 className="ui-text mt-[8px] break-words text-[17px] font-bold leading-8 text-ink">{user?.name}</h2>
            <p dir="ltr" className="mt-[1px] break-all text-[10.5px] leading-4 text-[#8E97A3]">{user?.email}</p>
            <p className="ui-text mt-[7px] text-[10.5px] leading-4 text-label">{t.profileRole}</p>
          </section>

          <button type="button" onClick={logout} className="ui-text flex min-h-[44px] w-full items-center justify-center rounded-[14px] border-[1.5px] border-maroon/70 bg-transparent text-[12px] font-semibold text-maroon transition hover:bg-maroon-soft">
            {t.profileSignOut}
          </button>
        </div>
      </Page>
    </>
  );
}
