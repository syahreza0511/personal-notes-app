import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addNote } from '../utils/network-data';
import { useLocale } from '../contexts/LocaleContext';
import translations from '../utils/translation';

function AddPage() {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const t = translations[locale];
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function onAddNoteHandler(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    let shouldNavigate = false;
    try {
      const response = await addNote({ title, body });
      if (response.error) {
        setSubmitError(response.message || t.saveError);
        return;
      }

      setTitle('');
      setBody('');
      shouldNavigate = true;
    } catch {
      setSubmitError(t.saveError);
    } finally {
      setIsSubmitting(false);
    }

    if (shouldNavigate) navigate('/');
  }

  return (
    <main className="add-new-page">
      <section className="add-new-page__input">
        <h2>{t.add}</h2>
        {submitError && (
          <p className="message-error" role="alert">
            {submitError}
          </p>
        )}
        <form onSubmit={onAddNoteHandler} aria-busy={isSubmitting}>
          <input
            className="add-new-page__input__title"
            type="text"
            aria-label={t.noteTitleLabel}
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <textarea
            className="add-new-page__input__body"
            aria-label={t.noteBodyLabel}
            placeholder={t.bodyPlaceholder}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            required
          />
          <div className="add-new-page__action">
            <button
              className="action"
              type="submit"
              aria-label={isSubmitting ? t.savingNote : t.saveNote}
              title={isSubmitting ? t.savingNote : t.saveNote}
              disabled={isSubmitting}
            >
              {isSubmitting ? '…' : '✓'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default AddPage;
