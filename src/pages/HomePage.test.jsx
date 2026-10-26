import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LocaleProvider } from '../contexts/LocaleContext';
import HomePage from './HomePage';
import { getActiveNotes } from '../utils/network-data';

vi.mock('../utils/network-data', () => ({
  getActiveNotes: vi.fn(),
}));

const sampleNotes = [
  {
    id: 'note-1',
    title: 'Meeting notes',
    body: 'Discuss the project roadmap',
    createdAt: '2026-10-26T12:00:00.000Z',
  },
  {
    id: 'note-2',
    title: 'Shopping list',
    body: 'Buy milk and bread',
    createdAt: '2026-10-25T12:00:00.000Z',
  },
];

function CurrentSearch() {
  const location = useLocation();
  return <output data-testid="current-search">{location.search}</output>;
}

function renderHome(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocaleProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        <CurrentSearch />
      </LocaleProvider>
    </MemoryRouter>,
  );
}

describe('HomePage search', () => {
  beforeEach(() => {
    getActiveNotes.mockResolvedValue({ error: false, data: sampleNotes });
  });

  it('uses the q query parameter to filter notes case-insensitively', async () => {
    renderHome('/?q=MEETING');

    expect(await screen.findByRole('link', { name: 'Meeting notes' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Shopping list' })).not.toBeInTheDocument();
  });

  it('updates q while preserving other query parameters', async () => {
    const user = userEvent.setup();
    renderHome('/?tab=all');

    const searchInput = screen.getByPlaceholderText('Cari catatan...');
    await user.type(searchInput, 'roadmap');

    await waitFor(() => {
      const params = new URLSearchParams(screen.getByTestId('current-search').textContent);
      expect(params.get('q')).toBe('roadmap');
      expect(params.get('tab')).toBe('all');
    });
  });

  it('removes q from the URL when the search field is cleared', async () => {
    const user = userEvent.setup();
    renderHome('/?q=meeting&tab=all');

    const searchInput = screen.getByPlaceholderText('Cari catatan...');
    await user.clear(searchInput);

    await waitFor(() => {
      const params = new URLSearchParams(screen.getByTestId('current-search').textContent);
      expect(params.has('q')).toBe(false);
      expect(params.get('tab')).toBe('all');
    });
  });

  it('shows a recoverable error instead of an empty-state message when loading fails', async () => {
    const user = userEvent.setup();
    getActiveNotes
      .mockResolvedValueOnce({ error: true, data: [], message: 'API unavailable' })
      .mockResolvedValueOnce({ error: false, data: sampleNotes });

    renderHome();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Catatan gagal dimuat. Periksa koneksi internet, lalu coba lagi.',
    );
    expect(screen.queryByText('Tidak ada catatan ditemukan')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByRole('link', { name: 'Meeting notes' })).toBeInTheDocument();
    expect(getActiveNotes).toHaveBeenCalledTimes(2);
  });
});
