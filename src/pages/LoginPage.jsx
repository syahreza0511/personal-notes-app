import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../utils/network-data';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function LoginPage() {
  const navigate = useNavigate();
  const { login: loginContext } = useAuth();
  const { locale } = useLocale();
  const t = translations[locale];
  const isIndonesian = locale === 'id';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onLoginHandler(event) {
    event.preventDefault();
    if (loading || isSuccess) return;

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await login({ email, password });
      if (response.error) {
        setMessage(response.message || t.loginError);
        return;
      }

      await loginContext(response.data);
      setIsSuccess(true);
      setMessage(t.loginSuccess);
      window.setTimeout(() => navigate('/'), 1000);
    } catch {
      setIsSuccess(false);
      setMessage(t.loginError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro" aria-labelledby="login-intro-title">
        <div className="login-intro__index" aria-hidden="true">
          <span>PERSONAL NOTES / 01</span>
          <span>YOUR SPACE</span>
        </div>
        <p className="login-intro__eyebrow">
          <span className="eyebrow-marker" aria-hidden="true" />
          {isIndonesian ? 'RUANG UNTUK IDE-IDE' : 'A SPACE FOR YOUR IDEAS'}
        </p>
        <h2 id="login-intro-title">
          {isIndonesian ? (
            <>
              Simpan ide.
              <br />
              <em>Temukan lagi.</em>
            </>
          ) : (
            <>
              Save an idea.
              <br />
              <em>Find it later.</em>
            </>
          )}
        </h2>
        <p className="login-intro__description">
          {isIndonesian
            ? 'Tempat yang tenang untuk menyimpan catatan, menyusun rencana, dan kembali menemukan hal yang penting.'
            : 'A calm place to keep notes, organize plans, and find the important things again.'}
        </p>

        <div className="library-preview" aria-hidden="true">
          <div className="library-preview__topline">
            <span>{isIndonesian ? 'KOLEKSI PRIBADI' : 'PERSONAL COLLECTION'}</span>
            <span>NO. 001</span>
          </div>
          <div className="library-preview__number">01 / NOTES</div>
          <p className="library-preview__title">
            {isIndonesian ? 'Hal penting, di satu tempat.' : 'What matters, in one place.'}
          </p>
          <div className="library-preview__lines">
            <span />
            <span />
            <span />
          </div>
          <div className="library-preview__bottomline">
            <span>{isIndonesian ? 'RUANG CATATANMU' : 'YOUR NOTE SPACE'}</span>
            <span>—</span>
          </div>
        </div>
      </section>

      <section className="login-panel" aria-labelledby="login-form-title">
        <div className="login-panel__meta">
          <span>{isIndonesian ? 'AKSES AKUN' : 'ACCOUNT ACCESS'}</span>
          <span>01 / 02</span>
        </div>
        <div className="login-panel__heading">
          <h2 id="login-form-title">{t.login}</h2>
          <p>
            {isIndonesian
              ? 'Masuk untuk melanjutkan ke ruang catatanmu.'
              : 'Sign in to return to your notes.'}
          </p>
        </div>

        {message && (
          <p
            aria-atomic="true"
            className={isSuccess ? 'message-success' : 'message-error'}
            role={isSuccess ? 'status' : 'alert'}
          >
            {message}
          </p>
        )}

        <form aria-busy={loading} onSubmit={onLoginHandler} className="input-login">
          <div className="auth-field">
            <label htmlFor="email">{t.email}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">{t.password}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading || isSuccess}>
            <span>{loading ? t.loginLoading : isSuccess ? t.loginSuccess : t.login}</span>
            <span className="login-submit__arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        </form>

        <p className="login-panel__register">
          {t.noAccount} <Link to="/register">{t.register}</Link>
        </p>
        <div className="login-panel__foot" aria-hidden="true">
          <span>
            {isIndonesian ? 'RUANG PRIBADI. IDE MILIKMU.' : 'A PRIVATE SPACE. YOUR IDEAS.'}
          </span>
          <span>© PN</span>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
