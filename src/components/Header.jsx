import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function Header() {
  const { authUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLocale } = useLocale();
  const t = translations[locale];
  const isIndonesian = locale === 'id';

  function navLinkClass({ isActive }) {
    return `sidebar__link${isActive ? ' is-active' : ''}`;
  }

  return (
    <header className="app-sidebar">
      <div className="sidebar__brand">
        <Link className="brand-mark" to="/" aria-label={t.title}>
          <span>N</span>
          <span className="brand-mark__accent">.</span>
        </Link>
        <div className="brand-copy">
          <span className="eyebrow">PERSONAL WORKSPACE</span>
          <h1>
            <Link to="/">{t.title}</Link>
          </h1>
        </div>
      </div>

      <div className="sidebar__meta" aria-hidden="true">
        <span>{isIndonesian ? 'RUANG CATATANMU' : 'YOUR NOTE SPACE'}</span>
        <span className="sidebar__meta-rule" />
        <span>01</span>
      </div>

      <nav
        className="sidebar__nav"
        aria-label={isIndonesian ? 'Navigasi utama' : 'Main navigation'}
      >
        <p className="sidebar__nav-label">{isIndonesian ? 'RUANG KERJA' : 'WORKSPACE'}</p>
        <ul>
          {authUser ? (
            <>
              <li>
                <NavLink to="/" end className={navLinkClass}>
                  <span className="sidebar__link-icon" aria-hidden="true">
                    ▤
                  </span>
                  <span>{isIndonesian ? 'Semua Catatan' : 'All Notes'}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/archives" className={navLinkClass}>
                  <span className="sidebar__link-icon" aria-hidden="true">
                    ▣
                  </span>
                  <span>{t.archive}</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/notes/new"
                  className={({ isActive }) =>
                    `sidebar__link sidebar__link--action${isActive ? ' is-active' : ''}`
                  }
                >
                  <span className="sidebar__link-icon" aria-hidden="true">
                    +
                  </span>
                  <span>{t.add}</span>
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className={navLinkClass}>
                  <span className="sidebar__link-icon" aria-hidden="true">
                    ↗
                  </span>
                  <span>{t.login}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className={navLinkClass}>
                  <span className="sidebar__link-icon" aria-hidden="true">
                    ＋
                  </span>
                  <span>{t.register}</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      <div className="sidebar__spacer" />

      <div
        className="sidebar__controls"
        role="group"
        aria-label={isIndonesian ? 'Preferensi tampilan' : 'Display preferences'}
      >
        <button
          className="sidebar__utility"
          type="button"
          onClick={toggleTheme}
          aria-label={
            theme === 'light'
              ? isIndonesian
                ? 'Aktifkan mode gelap'
                : 'Enable dark mode'
              : isIndonesian
                ? 'Aktifkan mode terang'
                : 'Enable light mode'
          }
          title={
            theme === 'light'
              ? isIndonesian
                ? 'Aktifkan mode gelap'
                : 'Enable dark mode'
              : isIndonesian
                ? 'Aktifkan mode terang'
                : 'Enable light mode'
          }
        >
          <span className="sidebar__utility-symbol" aria-hidden="true">
            {theme === 'light' ? '☾' : '☼'}
          </span>
          <span className="sidebar__utility-label">
            {theme === 'light'
              ? isIndonesian
                ? 'Mode gelap'
                : 'Dark mode'
              : isIndonesian
                ? 'Mode terang'
                : 'Light mode'}
          </span>
        </button>
        <button
          className="sidebar__utility sidebar__utility--language"
          type="button"
          onClick={toggleLocale}
          aria-label={isIndonesian ? 'Switch language to English' : 'Ganti bahasa ke Indonesia'}
          title={isIndonesian ? 'Switch language to English' : 'Ganti bahasa ke Indonesia'}
        >
          <span className="sidebar__utility-symbol sidebar__language-code" aria-hidden="true">
            {isIndonesian ? 'EN' : 'ID'}
          </span>
          <span className="sidebar__utility-label">{isIndonesian ? 'English' : 'Indonesia'}</span>
        </button>
      </div>

      {authUser ? (
        <div className="sidebar__user">
          <div className="sidebar__avatar" aria-hidden="true">
            {(authUser.name || 'U').trim().charAt(0).toUpperCase()}
          </div>
          <div className="sidebar__user-copy">
            <span className="eyebrow">{isIndonesian ? 'MASUK SEBAGAI' : 'SIGNED IN AS'}</span>
            <strong>{authUser.name}</strong>
          </div>
          <button className="sidebar__logout" type="button" onClick={logout}>
            {t.logout}
          </button>
        </div>
      ) : (
        <p className="sidebar__footer-note">
          {isIndonesian
            ? 'Simpan ide, rencana, dan hal penting dalam satu ruang.'
            : 'Keep ideas, plans, and the important things in one place.'}
        </p>
      )}
    </header>
  );
}

export default Header;
