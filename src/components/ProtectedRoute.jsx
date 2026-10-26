import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function ProtectedRoute({ children }) {
  const { authUser, isLoading, sessionError, retrySession } = useAuth();
  const { locale } = useLocale();
  const t = translations[locale];

  if (isLoading) {
    return (
      <main className="notes-list-empty" role="status">
        <p>{t.loading}</p>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="notes-list-empty" role="alert">
        <p>{t.sessionRestoreError}</p>
        <div className="detail-page__action">
          <button type="button" onClick={retrySession}>
            {t.retry}
          </button>
        </div>
      </main>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
