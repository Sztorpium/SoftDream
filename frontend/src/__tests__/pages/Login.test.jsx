import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '../../pages/Login';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext');

// A MemoryRouter-rel egy teljes routing környezetet szimulálunk, hogy a navigate('/') hívás
// tesztelhető legyen valódi BrowserRouter nélkül.
function renderLogin(loginFn = vi.fn()) {
    useAuth.mockReturnValue({ login: loginFn });

    render(
        <MemoryRouter initialEntries={['/login']}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<div>Főoldal</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Login oldal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rendereli az összes form elemet', () => {
        renderLogin();
        expect(screen.getByText('Bejelentkezés')).toBeInTheDocument();
        expect(screen.getByLabelText('username')).toBeInTheDocument();
        expect(screen.getByLabelText('password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Belépés' })).toBeInTheDocument();
    });

    it('üres submit esetén validációs hibákat jelenít meg', async () => {
        renderLogin();
        fireEvent.click(screen.getByRole('button', { name: 'Belépés' }));

        await waitFor(() => {
            expect(screen.getByText('A felhasználónév megadása kötelező.')).toBeInTheDocument();
            expect(screen.getByText('A jelszó megadása kötelező.')).toBeInTheDocument();
        });
    });

    it('blur esemény után is jelzi a kötelező jelszót', async () => {
        renderLogin();

        fireEvent.blur(screen.getByLabelText('password'));

        await waitFor(() => {
            expect(screen.getByText('A jelszó megadása kötelező.')).toBeInTheDocument();
        });
    });

    it('sikeres bejelentkezés után a főoldalra navigál', async () => {
        const loginMock = vi.fn().mockResolvedValue({});
        renderLogin(loginMock);

        await userEvent.type(screen.getByLabelText('username'), 'testuser');
        await userEvent.type(screen.getByLabelText('password'), 'password123');
        fireEvent.click(screen.getByRole('button', { name: 'Belépés' }));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
        });
        await waitFor(() => {
            expect(screen.getByText('Főoldal')).toBeInTheDocument();
        });
    });

    it('sikertelen bejelentkezés esetén hibaüzenetet jelenít meg', async () => {
        const loginMock = vi.fn().mockRejectedValue(new Error('Hibás felhasználónév vagy jelszó.'));
        renderLogin(loginMock);

        await userEvent.type(screen.getByLabelText('username'), 'wronguser');
        await userEvent.type(screen.getByLabelText('password'), 'wrongpass');
        fireEvent.click(screen.getByRole('button', { name: 'Belépés' }));

        await waitFor(() => {
            expect(screen.getByText('Hibás felhasználónév vagy jelszó.')).toBeInTheDocument();
        });
    });

    it('üres error message esetén alapértelmezett hibaüzenetet jelenít meg', async () => {
        const loginMock = vi.fn().mockRejectedValue({});
        renderLogin(loginMock);

        await userEvent.type(screen.getByLabelText('username'), 'wronguser');
        await userEvent.type(screen.getByLabelText('password'), 'wrongpass');
        fireEvent.click(screen.getByRole('button', { name: 'Belépés' }));

        await waitFor(() => {
            expect(screen.getByText('Sikertelen bejelentkezés.')).toBeInTheDocument();
        });
    });

    it('submit közben a gomb le van tiltva és "Beléptetés..." szöveget mutat', async () => {
        // Kontrollált Promise-szal szimulálunk egy folyamatban lévő API hívást,
        // hogy a loading állapotot a feloldás előtt is ellenőrizni tudjuk.
        let resolveFn;
        const loginMock = vi.fn().mockImplementation(
            () => new Promise((resolve) => { resolveFn = resolve; })
        );
        renderLogin(loginMock);

        await userEvent.type(screen.getByLabelText('username'), 'user');
        await userEvent.type(screen.getByLabelText('password'), 'pass');

        fireEvent.click(screen.getByRole('button', { name: 'Belépés' }));

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Beléptetés...' })).toBeDisabled();
        });

        resolveFn({});
    });

    it('a "Regisztrálj" link a /register oldalra mutat', () => {
        renderLogin();
        const link = screen.getByRole('link', { name: 'Regisztrálj' });
        expect(link).toHaveAttribute('href', '/register');
    });
});