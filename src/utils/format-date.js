export function formatNoteDate(value, locale = 'id') {
  const date = new Date(value);

  if (value === null || value === undefined || value === '' || Number.isNaN(date.getTime())) {
    return String(value ?? '');
  }

  const dateLocale = locale === 'id' ? 'id-ID' : 'en-US';

  return new Intl.DateTimeFormat(dateLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
