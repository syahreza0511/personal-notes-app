import { describe, expect, it } from 'vitest';
import { formatNoteDate } from './format-date';

const timestamp = '2026-10-26T12:23:41.438Z';

describe('formatNoteDate', () => {
  it('formats dates using Indonesian and the device time zone', () => {
    const expected = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));

    expect(formatNoteDate(timestamp, 'id')).toBe(expected);
  });

  it('formats dates using English and the device time zone', () => {
    const expected = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));

    expect(formatNoteDate(timestamp, 'en')).toBe(expected);
  });

  it('returns the original value instead of displaying Invalid Date', () => {
    expect(formatNoteDate('not-a-date', 'id')).toBe('not-a-date');
    expect(formatNoteDate(null, 'en')).toBe('');
  });
});
