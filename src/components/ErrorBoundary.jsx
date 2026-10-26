import { Component } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep technical details in the developer console, not in the user-facing UI.
    console.error('Error Boundary caught a rendering error:', error, info.componentStack);
  }

  handleRetry() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;

      return (
        <main className="error-boundary" role="alert">
          <div className="error-boundary__icon" aria-hidden="true">
            ⚠️
          </div>
          <h2>{t.errorBoundaryTitle}</h2>
          <p>{t.errorBoundaryDescription}</p>
          <div className="error-boundary__actions">
            <button type="button" onClick={this.handleRetry}>
              {t.errorBoundaryRetry}
            </button>
            <button
              type="button"
              className="error-boundary__reload"
              onClick={() => window.location.reload()}
            >
              {t.errorBoundaryReload}
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundary({ children }) {
  const location = useLocation();
  const { locale } = useLocale();
  const t = translations[locale] || translations.id;

  // A new pathname gets a fresh boundary, including when moving between note details.
  return (
    <ErrorBoundaryClass key={location.pathname} t={t}>
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundary;
