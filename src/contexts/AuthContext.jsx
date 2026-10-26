import { createContext, useContext, useEffect, useState } from 'react';
import { getUserLogged, putAccessToken } from '../utils/network-data';

const AuthContext = createContext();

function isAuthenticationFailure(message = '') {
  return /invalid token|unauthorized|unauthorised|not authenticated|belum login|token tidak valid|token.*(expired|invalid|valid)/i.test(
    String(message),
  );
}

function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [sessionAttempt, setSessionAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function checkUserLogin() {
      setIsLoading(true);
      setSessionError(false);

      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        if (isMounted) {
          setAuthUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getUserLogged();
        if (!isMounted) return;

        if (response.error || !response.data) {
          setAuthUser(null);
          if (response.error && !isAuthenticationFailure(response.message)) {
            // Non-authentication API errors may be temporary; keep the token and allow retry.
            setSessionError(true);
          } else {
            localStorage.removeItem('accessToken');
            setSessionError(false);
          }
        } else {
          setAuthUser(response.data);
        }
      } catch {
        if (isMounted) {
          // Keep the token on network failures so the user can retry session recovery.
          setAuthUser(null);
          setSessionError(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkUserLogin();
    return () => {
      isMounted = false;
    };
  }, [sessionAttempt]);

  async function login(userData) {
    try {
      putAccessToken(userData.accessToken);
      const response = await getUserLogged();

      if (response.error || !response.data) {
        throw new Error(response.message || 'Unable to verify the signed-in user.');
      }

      setAuthUser(response.data);
      setSessionError(false);
      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      setAuthUser(null);
      throw error;
    }
  }

  function logout() {
    localStorage.removeItem('accessToken');
    setAuthUser(null);
    setSessionError(false);
  }

  function retrySession() {
    setIsLoading(true);
    setSessionError(false);
    setSessionAttempt((attempt) => attempt + 1);
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        login,
        logout,
        isLoading,
        sessionError,
        retrySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };
