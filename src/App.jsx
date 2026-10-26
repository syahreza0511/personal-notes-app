import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import AddPage from './pages/AddPage';
import ArchivePage from './pages/ArchivePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="app-shell">
      <div className="app-landscape" aria-hidden="true">
        <span className="app-landscape__haze" />
        <span className="app-landscape__moon" />
        <span className="app-landscape__mountain app-landscape__mountain--far" />
        <span className="app-landscape__mountain app-landscape__mountain--mid" />
        <span className="app-landscape__mountain app-landscape__mountain--near" />
      </div>
      <Header />
      <div className="app-content">
        <Routes>
          <Route
            path="/login"
            element={
              <ErrorBoundary>
                <LoginPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/register"
            element={
              <ErrorBoundary>
                <RegisterPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/notes/new"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <AddPage />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <DetailPage />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="/archives"
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <ArchivePage />
                </ProtectedRoute>
              </ErrorBoundary>
            }
          />
          <Route
            path="*"
            element={
              <ErrorBoundary>
                <NotFoundPage />
              </ErrorBoundary>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
