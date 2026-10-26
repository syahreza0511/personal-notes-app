import { createContext, useContext, useEffect, useState } from 'react';

const LocaleContext = createContext();

function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'id';
  });
  useEffect(() => {
    localStorage.setItem('locale', locale);
  }, [locale]);
  function toggleLocale() {
    setLocale((currentLocale) => (currentLocale === 'id' ? 'en' : 'id'));
  }
  return (
    <LocaleContext.Provider
      value={{
        locale,
        toggleLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

function useLocale() {
  return useContext(LocaleContext);
}

export { LocaleProvider, useLocale };
