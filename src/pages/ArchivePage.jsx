import { useEffect, useState } from 'react';
import NoteItem from '../components/NoteItem';
import { getArchivedNotes } from '../utils/network-data';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function ArchivePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { locale } = useLocale();
  const t = translations[locale];

  useEffect(() => {
    let isMounted = true;

    async function fetchArchivedNotes() {
      setLoading(true);
      setLoadError(false);

      try {
        const response = await getArchivedNotes();
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

    fetchArchivedNotes();
    return () => {
      isMounted = false;
    };
  }, [loadAttempt]);

  return (
    <main className="archive-page">
      <h2>{t.archiveTitle}</h2>
      {loading ? (
        <div className="notes-list-empty" role="status">
          <p>{t.loading}</p>
        </div>
      ) : loadError ? (
        <div className="notes-list-empty" role="alert">
          <p>{t.loadError}</p>
          <div className="detail-page__action">
            <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
              {t.retry}
            </button>
          </div>
        </div>
      ) : notes.length > 0 ? (
        <div className="notes-list">
          {notes.map((note) => (
            <NoteItem key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="notes-list-empty">
          <p>{t.noArchive}</p>
        </div>
      )}
    </main>
  );
}

export default ArchivePage;
