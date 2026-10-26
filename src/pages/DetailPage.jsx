import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { archiveNote, deleteNote, getNote, unarchiveNote } from '../utils/network-data';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';
import { formatNoteDate } from '../utils/format-date';

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [actionLoading, setActionLoading] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const { locale } = useLocale();
  const t = translations[locale];

  useEffect(() => {
    let isMounted = true;

    async function fetchDetailNote() {
      setLoading(true);
      setLoadError(false);
      setNote(null);

      try {
        const response = await getNote(id);
        if (!isMounted) return;

        if (response.error) {
          setLoadError(true);
          return;
        }

        setNote(response.data || null);
      } catch {
        if (isMounted) setLoadError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetailNote();
    return () => {
      isMounted = false;
    };
  }, [id, loadAttempt]);

  async function runNoteAction(action) {
    if (actionLoading) return;
    if (action === 'delete' && !window.confirm(t.confirmDelete)) return;

    setActionLoading(action);
    setActionMessage('');

    let destination = '';
    try {
      let response;
      if (action === 'delete') response = await deleteNote(id);
      if (action === 'archive') response = await archiveNote(id);
      if (action === 'unarchive') response = await unarchiveNote(id);

      if (response.error) {
        setActionMessage(response.message || t.actionError);
        return;
      }

      destination = action === 'archive' ? '/archives' : '/';
    } catch {
      setActionMessage(t.actionError);
    } finally {
      setActionLoading('');
    }

    if (destination) navigate(destination);
  }

  if (loading) {
    return (
      <main className="detail-page">
        <div className="notes-list-empty" role="status">
          <p>{t.loading}</p>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="detail-page">
        <div className="notes-list-empty" role="alert">
          <p>{t.loadError}</p>
          <div className="detail-page__action">
            <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
              {t.retry}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="detail-page">
        <div className="notes-list-empty">
          <p>{t.noteNotFound}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <article>
        <h2 className="detail-page__title">{note.title}</h2>
        <time className="detail-page__createdAt" dateTime={note.createdAt}>
          {formatNoteDate(note.createdAt, locale)}
        </time>
        <p className="detail-page__body">{note.body}</p>
        {actionMessage && (
          <p className="message-error" role="alert">
            {actionMessage}
          </p>
        )}
        <div className="detail-page__action">
          {note.archived ? (
            <button
              type="button"
              onClick={() => runNoteAction('unarchive')}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === 'unarchive' ? t.unarchiving : t.unarchive}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => runNoteAction('archive')}
              disabled={Boolean(actionLoading)}
            >
              {actionLoading === 'archive' ? t.archiving : t.archiveAction}
            </button>
          )}
          <button
            type="button"
            onClick={() => runNoteAction('delete')}
            disabled={Boolean(actionLoading)}
          >
            {actionLoading === 'delete' ? t.deleting : t.delete}
          </button>
        </div>
      </article>
    </main>
  );
}

export default DetailPage;
