import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { LocaleProvider } from '../contexts/LocaleContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { getUserLogged, login, putAccessToken, register } from '../utils/network-data';

vi.mock('../utils/network-data', () => ({
  getUserLogged: vi.fn(),
  login: vi.fn(),
  putAccessToken: vi.fn(),
  register: vi.fn(),
}));

function renderAuthPage(page) {
  return render(
    <MemoryRouter>
      <LocaleProvider>
        <AuthProvider>{page}</AuthProvider>
      </LocaleProvider>
    </MemoryRouter>,
  );
}

async function fillRegistrationForm(user) {
  await user.type(screen.getByLabelText('Nama'), 'Syahreza');
  await user.type(screen.getByLabelText('Email'), 'user@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
}

describe('authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserLogged.mockResolvedValue({
      error: false,
      data: { id: 'user-1', name: 'Syahreza' },
    });
  });

  it('provides autocomplete and required attributes on login fields', () => {
    renderAuthPage(<LoginPage />);
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');

    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(email).toBeRequired();
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(password).toBeRequired();
  });

  it('provides autocomplete and required attributes on registration fields', () => {
    renderAuthPage(<RegisterPage />);
    const name = screen.getByLabelText('Nama');
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');

    expect(name).toHaveAttribute('autocomplete', 'name');
    expect(name).toBeRequired();
    expect(email).toHaveAttribute('type', 'email');
    expect(email).toHaveAttribute('autocomplete', 'email');
    expect(email).toBeRequired();
    expect(password).toHaveAttribute('autocomplete', 'new-password');
    expect(password).toBeRequired();
  });

  it('shows login loading state and disables repeated submission', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    login.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    renderAuthPage(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    const form = screen.getByLabelText('Email').closest('form');
    expect(screen.getByRole('button', { name: 'Sedang login...' })).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');

    resolveLogin({ error: true, message: 'Email atau password salah.' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Email atau password salah.');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled();
      expect(form).toHaveAttribute('aria-busy', 'false');
    });
  });

  it('shows registration loading and announces API errors accessibly', async () => {
    const user = userEvent.setup();
    let resolveRegister;
    register.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve;
      }),
    );

    renderAuthPage(<RegisterPage />);
    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    const form = screen.getByLabelText('Email').closest('form');
    expect(screen.getByRole('button', { name: 'Sedang mendaftar...' })).toBeDisabled();
    expect(form).toHaveAttribute('aria-busy', 'true');
    expect(register).toHaveBeenCalledTimes(1);

    resolveRegister({ error: true, message: 'Email sudah digunakan.' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Email sudah digunakan.');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
      expect(form).toHaveAttribute('aria-busy', 'false');
    });
  });

  it('shows a friendly alert and restores the button when registration throws', async () => {
    const user = userEvent.setup();
    register.mockRejectedValue(new Error('Network failure'));

    renderAuthPage(<RegisterPage />);
    await fillRegistrationForm(user);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Terjadi kesalahan saat registrasi. Silakan coba lagi.',
    );
    expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled();
  });

  it('does not report login success when the signed-in user cannot be verified', async () => {
    const user = userEvent.setup();
    login.mockResolvedValue({ error: false, data: { accessToken: 'new-token' } });
    getUserLogged.mockResolvedValue({ error: true, data: null, message: 'Invalid token' });

    renderAuthPage(<LoginPage />);
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Terjadi kesalahan saat login. Silakan coba lagi.',
    );
    expect(screen.queryByText('Login berhasil.')).not.toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('allows retrying session recovery after a temporary network failure', async () => {
    const user = userEvent.setup();
    localStorage.setItem('accessToken', 'existing-token');
    getUserLogged
      .mockRejectedValueOnce(new Error('Network failure'))
      .mockResolvedValueOnce({ error: false, data: { id: 'user-1', name: 'Syahreza' } });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <LocaleProvider>
          <AuthProvider>
            <Routes>
              <Route
                path="/private"
                element={
                  <ProtectedRoute>
                    <p>Private notes</p>
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<p>Login page</p>} />
            </Routes>
          </AuthProvider>
        </LocaleProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sesi belum dapat dipulihkan. Periksa koneksi internet, lalu coba lagi.',
    );
    await user.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Private notes')).toBeInTheDocument();
    expect(localStorage.getItem('accessToken')).toBe('existing-token');
  });
});
