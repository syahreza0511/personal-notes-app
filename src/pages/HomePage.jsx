import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import NoteItem from '../components/NoteItem';
import { getActiveNotes } from '../utils/network-data';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function HomePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const { locale } = useLocale();
  const t = translations[locale];
  const isIndonesian = locale === 'id';

  useEffect(() => {
    let isMounted = true;

    async function fetchNotes() {
      setLoading(true);
      setLoadError(false);

      try {
        const response = await getActiveNotes();
        if (!isMounted) return;

        if (response.error || !Array.isArray(response.data)) {
          setNotes([]);
          setLoadError(true);
          return;
        }

        setNotes(response.data);
      } catch {
        if (isMounted) {
          setNotes([]);
          setLoadError(true);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNotes();
    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  function onSearchHandler(event) {
    const nextKeyword = event.target.value;
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (nextKeyword.trim()) {
        nextParams.set('q', nextKeyword);
      } else {
        nextParams.delete('q');
      }
      return nextParams;
    });
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredNotes = notes.filter((note) => {
    const title = String(note.title ?? '').toLowerCase();
    const body = String(note.body ?? '').toLowerCase();
    return title.includes(normalizedKeyword) || body.includes(normalizedKeyword);
  });

  return (
    <main className="home-page">
      <section className="notes-hero" aria-labelledby="notes-heading">
        <div className="notes-hero__content">
          <p className="notes-hero__eyebrow">
            <span className="notes-hero__eyebrow-dot" aria-hidden="true" />
            {isIndonesian ? 'RUANG KERJA PRIBADI' : 'YOUR PERSONAL WORKSPACE'}
          </p>
          <h2 id="notes-heading">{t.allNotes}</h2>
          <p className="notes-hero__description">
            {isIndonesian
              ? 'Semua hal penting, tersimpan rapi di satu tempat.'
              : 'Keep the things that matter, all in one place.'}
          </p>
          <div className="notes-hero__meta">
            <span className="notes-hero__count">
              {loading
                ? t.loading
                : loadError
                  ? '—'
                  : `${filteredNotes.length} ${isIndonesian ? 'catatan' : filteredNotes.length === 1 ? 'note' : 'notes'}`}
            </span>
            <span className="notes-hero__meta-divider" aria-hidden="true" />
            <span>{isIndonesian ? 'Koleksi personal' : 'Personal collection'}</span>
          </div>
        </div>
      </section>

      <div className="notes-toolbar">
        <div className="search-bar">
          <span className="search-bar__icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            aria-label={t.search}
            placeholder={t.search}
            value={keyword}
            onChange={onSearchHandler}
          />
        </div>
        <span className="notes-toolbar__label">
          {isIndonesian ? 'DAFTAR CATATAN' : 'YOUR COLLECTION'}
        </span>
      </div>

      {loading ? (
        <div className="notes-list-empty" role="status">
          <span className="empty-state__mark" aria-hidden="true">
            …
          </span>
          <p>{t.loading}</p>
        </div>
      ) : loadError ? (
        <div className="notes-list-empty" role="alert">
          <span className="empty-state__mark" aria-hidden="true">
            !
          </span>
          <p>{t.loadError}</p>
          <div className="detail-page__action">
            <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
              {t.retry}
            </button>
          </div>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="notes-list-empty">
          <span className="empty-state__mark" aria-hidden="true">
            ◌
          </span>
          <p>{t.noNotes}</p>
        </div>
      )}

      <div className="homepage__action">
        <Link className="action" to="/notes/new" aria-label={t.add} title={t.add}>
          +
        </Link>
      </div>
    </main>
  );
}

export default HomePage;
