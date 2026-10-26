import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LocaleProvider } from '../contexts/LocaleContext';
import ErrorBoundary from './ErrorBoundary';

let shouldThrow;

function SometimesBrokenContent() {
  if (shouldThrow) {
    throw new Error('Expected test rendering error');
  }

  return <p>Recovered content</p>;
}

function renderErrorBoundary() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <LocaleProvider>
        <ErrorBoundary>
          <SometimesBrokenContent />
        </ErrorBoundary>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows the Indonesian fallback and can retry rendering', () => {
    renderErrorBoundary();

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Oops! Terjadi Kesalahan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Muat Ulang Halaman' })).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Coba Lagi' }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the fallback in English when English is selected', () => {
    localStorage.setItem('locale', 'en');

    renderErrorBoundary();

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload Page' })).toBeInTheDocument();
  });
});
