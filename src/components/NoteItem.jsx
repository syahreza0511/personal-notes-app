import { Link } from 'react-router-dom';
import { useLocale } from '../contexts/LocaleContext';
import { formatNoteDate } from '../utils/format-date';

function NoteItem({ note }) {
  const { locale } = useLocale();

  return (
    <article className="note-item">
      <div className="note-item__topline">
        <span className="note-item__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="note-item__type">{locale === 'id' ? 'CATATAN' : 'NOTE'}</span>
        <span className="note-item__corner-mark" aria-hidden="true">
          ↗
        </span>
      </div>
      <h2 className="note-item__title">
        <Link to={`/notes/${note.id}`}>{note.title}</Link>
      </h2>
      <p className="note-item__body">{note.body}</p>
      <div className="note-item__footer">
        <time className="note-item__createdAt" dateTime={note.createdAt}>
          {formatNoteDate(note.createdAt, locale)}
        </time>
        <span className="note-item__footer-rule" aria-hidden="true" />
      </div>
    </article>
  );
}

export default NoteItem;
