import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../utils/network-data';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function RegisterPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = translations[locale];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onRegisterHandler(event) {
    event.preventDefault();
    if (loading || isSuccess) return;

    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await register({ name, email, password });
      if (response.error) {
        setMessage(response.message);
        return;
      }

      setIsSuccess(true);
      setMessage(t.registerSuccess);
      window.setTimeout(() => navigate('/login'), 1500);
    } catch {
      setIsSuccess(false);
      setMessage(t.registerError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <h2>{t.register}</h2>
      {message && (
        <p
          aria-atomic="true"
          className={isSuccess ? 'message-success' : 'message-error'}
          role={isSuccess ? 'status' : 'alert'}
        >
          {message}
        </p>
      )}
      <form aria-busy={loading} onSubmit={onRegisterHandler} className="input-register">
        <label htmlFor="name">{t.name}</label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <label htmlFor="email">{t.email}</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="password">{t.password}</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit" disabled={loading || isSuccess}>
          {loading ? t.registerLoading : isSuccess ? t.registerSuccess : t.register}
        </button>
      </form>
      <p>
        {t.haveAccount} <Link to="/login">{t.login}</Link>
      </p>
    </main>
  );
}

export default RegisterPage;
