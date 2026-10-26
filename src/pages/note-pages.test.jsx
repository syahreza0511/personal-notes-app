import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LocaleProvider } from '../contexts/LocaleContext';
import AddPage from './AddPage';
import ArchivePage from './ArchivePage';
import DetailPage from './DetailPage';
import { addNote, archiveNote, getArchivedNotes, getNote } from '../utils/network-data';

vi.mock('../utils/network-data', () => ({
  addNote: vi.fn(),
  archiveNote: vi.fn(),
  deleteNote: vi.fn(),
  getArchivedNotes: vi.fn(),
  getNote: vi.fn(),
  unarchiveNote: vi.fn(),
}));

function renderPage(page, initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocaleProvider>{page}</LocaleProvider>
    </MemoryRouter>,
  );
}

function renderDetail(initialEntry = '/notes/note-1') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocaleProvider>
        <Routes>
          <Route path="/notes/:id" element={<DetailPage />} />
          <Route path="/" element={<p>All notes</p>} />
          <Route path="/archives" element={<p>Archived notes</p>} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

const sampleNote = {
  id: 'note-1',
  title: 'Meeting notes',
  body: 'Discuss the project roadmap',
  createdAt: '2026-10-26T12:00:00.000Z',
  archived: false,
};

describe('note pages resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a recoverable error when loading archived notes fails', async () => {
    const user = userEvent.setup();
    getArchivedNotes
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({ error: false, data: [] });

    renderPage(<ArchivePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Catatan gagal dimuat. Periksa koneksi internet, lalu coba lagi.',
    );
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Tidak ada catatan arsip')).toBeInTheDocument();
    expect(getArchivedNotes).toHaveBeenCalledTimes(2);
  });

  it('shows an accessible error and re-enables the save button if adding a note fails', async () => {
    const user = userEvent.setup();
    addNote.mockRejectedValue(new Error('Network failure'));

    renderPage(<AddPage />);
    await user.type(screen.getByLabelText('Judul catatan'), 'A new note');
    await user.type(screen.getByLabelText('Isi catatan'), 'A useful note body');
    await user.click(screen.getByRole('button', { name: 'Simpan catatan' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Catatan gagal disimpan. Periksa koneksi internet, lalu coba lagi.',
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Simpan catatan' })).toBeEnabled();
    });
    expect(addNote).toHaveBeenCalledWith({ title: 'A new note', body: 'A useful note body' });
  });

  it('allows retrying a failed note detail request', async () => {
    const user = userEvent.setup();
    getNote
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({ error: false, data: sampleNote });

    renderDetail();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Catatan gagal dimuat. Periksa koneksi internet, lalu coba lagi.',
    );
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByRole('heading', { name: 'Meeting notes' })).toBeInTheDocument();
    expect(getNote).toHaveBeenCalledTimes(2);
  });

  it('prevents repeated archive actions and announces API errors', async () => {
    const user = userEvent.setup();
    let resolveArchive;
    getNote.mockResolvedValue({ error: false, data: sampleNote });
    archiveNote.mockReturnValue(
      new Promise((resolve) => {
        resolveArchive = resolve;
      }),
    );

    renderDetail();
    await screen.findByRole('heading', { name: 'Meeting notes' });
    await user.click(screen.getByRole('button', { name: 'Arsipkan' }));

    expect(screen.getByRole('button', { name: 'Mengarsipkan...' })).toBeDisabled();
    resolveArchive({ error: true, message: 'Archive failed' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Archive failed');
    expect(screen.getByRole('button', { name: 'Arsipkan' })).toBeEnabled();
    expect(archiveNote).toHaveBeenCalledTimes(1);
  });
});
