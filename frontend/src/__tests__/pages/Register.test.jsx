import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Register from '../../pages/Register';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext');

function renderRegister(registerFn = vi.fn()) {
    useAuth.mockReturnValue({ register: registerFn });

    render(
        <MemoryRouter initialEntries={['/register']}>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<div>Főoldal</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('Register oldal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rendereli az összes form elemet', () => {
        renderRegister();
        // A getByRole('heading') kell, mert a "Regisztráció" szöveg a címben és a gombon is megjelenik.
        expect(screen.getByRole('heading', { name: 'Regisztráció' })).toBeInTheDocument();
        expect(screen.getByLabelText('username')).toBeInTheDocument();
        expect(screen.getByLabelText('email')).toBeInTheDocument();
        expect(screen.getByLabelText('phone')).toBeInTheDocument();
        expect(screen.getByLabelText('password')).toBeInTheDocument();
    });

    it('üres submit esetén kötelező mezők validációs hibáit mutatja', async () => {
        renderRegister();
        fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

        await waitFor(() => {
            expect(screen.getByText('A felhasználónév megadása kötelező.')).toBeInTheDocument();
            expect(screen.getByText('Az email megadása kötelező.')).toBeInTheDocument();
            expect(screen.getByText('A telefonszám megadása kötelező.')).toBeInTheDocument();
            expect(screen.getByText('A jelszó megadása kötelező.')).toBeInTheDocument();
        });
    });

    it('blur után megjelenik a kötelező mező hibája', async () => {
        renderRegister();

        fireEvent.blur(screen.getByLabelText('username'));

        await waitFor(() => {
            expect(screen.getByText('A felhasználónév megadása kötelező.')).toBeInTheDocument();
        });
    });

    it('sikeres regisztráció után a főoldalra navigál', async () => {
        const registerMock = vi.fn().mockResolvedValue({});
        renderRegister(registerMock);

        await userEvent.type(screen.getByLabelText('username'), 'ujfelhasznalo');
        await userEvent.type(screen.getByLabelText('email'), 'uj@email.com');
        await userEvent.type(screen.getByLabelText('phone'), '06301234567');
        await userEvent.type(screen.getByLabelText('password'), 'biztonsagos123');
        fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

        await waitFor(() => {
            expect(registerMock).toHaveBeenCalledWith({
                username: 'ujfelhasznalo',
                email: 'uj@email.com',
                phone: '06301234567',
                password: 'biztonsagos123',
            });
        });
        await waitFor(() => {
            expect(screen.getByText('Főoldal')).toBeInTheDocument();
        });
    });

    it('általános szerverhibát hibaüzenetben jelenít meg', async () => {
        const registerMock = vi.fn().mockRejectedValue(
            new Error('Ez a felhasználónév már foglalt.')
        );
        renderRegister(registerMock);

        await userEvent.type(screen.getByLabelText('username'), 'foglalt');
        await userEvent.type(screen.getByLabelText('email'), 'a@b.com');
        await userEvent.type(screen.getByLabelText('phone'), '06301234567');
        await userEvent.type(screen.getByLabelText('password'), 'jelszo123');
        fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

        await waitFor(() => {
            expect(screen.getByText('Ez a felhasználónév már foglalt.')).toBeInTheDocument();
        });
    });

    it('ha a szerverhiba üzenet nélkül jön, alapértelmezett szöveget mutat', async () => {
        const registerMock = vi.fn().mockRejectedValue({});
        renderRegister(registerMock);

        await userEvent.type(screen.getByLabelText('username'), 'foglalt');
        await userEvent.type(screen.getByLabelText('email'), 'a@b.com');
        await userEvent.type(screen.getByLabelText('phone'), '06301234567');
        await userEvent.type(screen.getByLabelText('password'), 'jelszo123');
        fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

        await waitFor(() => {
            expect(screen.getByText('Sikertelen regisztráció.')).toBeInTheDocument();
        });
    });

    it('mező-szintű szerverhibákat a megfelelő input mellett jelenít meg', async () => {
        // A backend { fields: { fieldName: "hibaüzenet" } } formában adja vissza a
        // validációs hibákat, amelyeket a Register.jsx az inputok helperText-jébe tesz.
        const fieldError = new Error('Validációs hiba');
        fieldError.fields = { username: 'Foglalt!', email: 'Érvénytelen email.' };
        const registerMock = vi.fn().mockRejectedValue(fieldError);
        renderRegister(registerMock);

        await userEvent.type(screen.getByLabelText('username'), 'valaki');
        await userEvent.type(screen.getByLabelText('email'), 'rossz-email');
        await userEvent.type(screen.getByLabelText('phone'), '06301234567');
        await userEvent.type(screen.getByLabelText('password'), 'pw123');
        fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

        await waitFor(() => {
            expect(screen.getByText('Foglalt!')).toBeInTheDocument();
            expect(screen.getByText('Érvénytelen email.')).toBeInTheDocument();
        });
    });

    it('ha egy mezőhöz volt szerverhiba, új begépelésnél törli azt a mezőhibát', async () => {
        const fieldError = new Error('Validációs hiba');
        fieldError.fields = { username: 'Foglalt!' };
        const registerMock = vi.fn().mockRejectedValue(fieldError);
        renderRegister(registerMock);

        await userEvent.type(screen.getByLabelText('username'), 'valaki');
        await userEvent.type(screen.getByLabelText('email'), 'ok@ok.com');
        await userEvent.type(screen.getByLabelText('phone'), '06301234567');
        await userEvent.type(screen.getByLabelText('password'), 'pw12345');
        fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

        await waitFor(() => {
            expect(screen.getByText('Foglalt!')).toBeInTheDocument();
        });

        await userEvent.type(screen.getByLabelText('username'), 'x');

        await waitFor(() => {
            expect(screen.queryByText('Foglalt!')).not.toBeInTheDocument();
        });
    });

    it('a "Jelentkezz be" link a /login oldalra mutat', () => {
        renderRegister();
        const link = screen.getByRole('link', { name: 'Jelentkezz be' });
        expect(link).toHaveAttribute('href', '/login');
    });
});