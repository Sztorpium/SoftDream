import * as React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authApi from '../../api/auth';
import * as usersApi from '../../api/users';

// Az AuthContext mindkét API modult használja: az authApi a login/logout/register műveletekhez kell,
// a usersApi pedig a profil szinkronizáláshoz, vagyis mount után frissíti a tárolt user adatot a backendről.
vi.mock('../../api/auth');
vi.mock('../../api/users');

const STORAGE_KEY = 'softdream_auth';

// Egyszerű fogyasztó komponens, ami kiírja a context összes értékét, és gombokat ad
// az egyes műveletek indításához. Így a teszt a DOM-on keresztül éri el az állapotot.
function TestConsumer() {
    const { user, token, isAdmin, loading, login, logout, register, updateCurrentUser } = useAuth();
    return (
        <div>
            <span data-testid="loading">{String(loading)}</span>
            <span data-testid="user">{user ? JSON.stringify(user) : 'null'}</span>
            <span data-testid="token">{token ?? 'null'}</span>
            <span data-testid="isAdmin">{String(isAdmin)}</span>
            <button onClick={() => login({ username: 'test', password: 'pw' })}>login</button>
            <button onClick={() => logout()}>logout</button>
            <button onClick={() => register({ username: 'u', email: 'e@e.com', phone: '06301', password: 'pw' })}>register</button>
            <button onClick={() => updateCurrentUser({ email: 'new@example.com' })}>update</button>
        </div>
    );
}

function renderWithProvider() {
    return render(
        <AuthProvider>
            <TestConsumer />
        </AuthProvider>
    );
}

describe('AuthContext', () => {
    let consoleWarn;

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });
    });

    afterEach(() => {
        localStorage.clear();
        consoleWarn.mockRestore();
    });

    describe('kezdőállapot', () => {
        it('hibás localStorage JSON esetén biztonságosan null auth állapottal indul', async () => {
            localStorage.setItem(STORAGE_KEY, '{invalid-json');
            usersApi.getMyProfile = vi.fn();

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('token').textContent).toBe('null');
        });

        it('token nélkül loading=false, user=null', async () => {
            usersApi.getMyProfile = vi.fn();
            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('token').textContent).toBe('null');
            expect(screen.getByTestId('isAdmin').textContent).toBe('false');
        });

        it('localStorage-ból betölti a tárolt auth adatot', async () => {
            const stored = { token: 'abc123', user: { userId: 1, username: 'u1', email: 'u@u.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

            // getMyProfile mock: a context mountoláskor frissíti a user adatot a backendről.
            usersApi.getMyProfile = vi.fn().mockResolvedValue({
                userId: 1, username: 'u1', email: 'u@u.com', role: 'USER',
            });

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('token').textContent).toBe('abc123');
        });

        it('profil szinkronnál az id mezőt is userId-re mappeli', async () => {
            const stored = { token: 'abc123', user: { userId: 1, username: 'u1', email: 'u@u.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue({
                id: 99,
                username: 'fresh-user',
                email: 'fresh@u.com',
                role: 'USER',
            });

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

            const user = JSON.parse(screen.getByTestId('user').textContent);
            expect(user.userId).toBe(99);
            expect(user.username).toBe('fresh-user');
        });

        it('ha profil szinkron hiba történik, a tárolt auth marad fallbackként', async () => {
            const stored = {
                token: 'fallback-token',
                user: { userId: 7, username: 'fallback', email: 'f@u.com', role: 'USER' },
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockRejectedValue(new Error('backend down'));

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('token').textContent).toBe('fallback-token');
            expect(screen.getByTestId('user').textContent).toContain('fallback');
        });
        
        it('ha a profil szinkron 401-et kap (lejárt token), az auth törlődik', async () => {
            const stored = {
                token: 'expired-token',
                user: { userId: 7, username: 'olduser', email: 'o@u.com', role: 'USER' },
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            const err = new Error('Unauthorized');
            err.status = 401;
            usersApi.getMyProfile = vi.fn().mockRejectedValue(err);

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('token').textContent).toBe('null');
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it('auth:sessionExpired esemény hatására az auth törlődik', async () => {
            const stored = { token: 'tok', user: { userId: 1, username: 'u', email: 'e@e.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue(stored.user);

            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('tok'));

            await act(async () => {
                window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
            });

            await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('null'));
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });
    });

    describe('isAdmin', () => {
        it('ADMIN szerepkörű felhasználóra isAdmin=true', async () => {
            // A backend "ADMIN" stringet ad vissza, nem "ROLE_ADMIN".
            const stored = { token: 'tok', user: { userId: 2, username: 'admin', email: 'a@a.com', role: 'ADMIN' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue({ ...stored.user });

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('isAdmin').textContent).toBe('true');
        });

        it('USER szerepkörű felhasználóra isAdmin=false', async () => {
            const stored = { token: 'tok', user: { userId: 3, username: 'user1', email: 'u@u.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue({ ...stored.user });

            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('isAdmin').textContent).toBe('false');
        });
    });

    describe('login', () => {
        it('sikeres login után auth állapotot és localStorage-t frissíti', async () => {
            usersApi.getMyProfile = vi.fn();
            authApi.login = vi.fn().mockResolvedValue({
                token: 'jwt-tok',
                userId: 5,
                username: 'testuser',
                email: 't@t.com',
                role: 'USER',
            });

            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

            // Az act() szükséges, mert a gombkattintás állapotváltozást vált ki.
            await act(async () => {
                screen.getByText('login').click();
            });

            await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('jwt-tok'));

            // Ellenőrizzük, hogy a localStorage is frissült-e.
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            expect(stored.token).toBe('jwt-tok');
            expect(stored.user.username).toBe('testuser');
        });
    });

    describe('register', () => {
        it('sikeres register után auth állapotot és localStorage-t frissíti', async () => {
            usersApi.getMyProfile = vi.fn();
            authApi.register = vi.fn().mockResolvedValue({
                token: 'jwt-reg',
                userId: 8,
                username: 'new-user',
                email: 'new@u.com',
                role: 'USER',
            });

            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

            await act(async () => {
                screen.getByText('register').click();
            });

            await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('jwt-reg'));

            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
            expect(stored.user.username).toBe('new-user');
            expect(authApi.register).toHaveBeenCalledWith({
                username: 'u',
                email: 'e@e.com',
                phone: '06301',
                password: 'pw',
            });
        });
    });

    describe('logout', () => {
        it('logout után user és token null lesz, localStorage törlődik', async () => {
            const stored = { token: 'tok', user: { userId: 1, username: 'u', email: 'e@e.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue(stored.user);
            authApi.logout = vi.fn().mockResolvedValue(null);

            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('tok'));

            await act(async () => {
                screen.getByText('logout').click();
            });

            await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('null'));
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });

        it('ha a backend logout hibával tér vissza, helyi állapot mégis törlődik', async () => {
            // A context a logout() finally blokkjában törli a helyi állapotot,
            // ezért backend hiba esetén is ki kell jelentkeztetni a felhasználót.
            const stored = { token: 'tok', user: { userId: 1, username: 'u', email: 'e@e.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue(stored.user);
            authApi.logout = vi.fn().mockRejectedValue(new Error('403 Forbidden'));

            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('tok'));

            await act(async () => {
                screen.getByText('logout').click();
            });

            await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('null'));
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
            expect(consoleWarn).toHaveBeenCalled();
        });
    });

    describe('updateCurrentUser', () => {
        it('csak a megadott mezőket frissíti, a többit megtartja', async () => {
            const stored = { token: 'tok', user: { userId: 1, username: 'u', email: 'old@e.com', role: 'USER' } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
            usersApi.getMyProfile = vi.fn().mockResolvedValue(stored.user);

            renderWithProvider();
            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

            await act(async () => {
                screen.getByText('update').click();
            });

            // Csak az email változik, a username és a többi mező megmarad.
            await waitFor(() => {
                const user = JSON.parse(screen.getByTestId('user').textContent);
                expect(user.email).toBe('new@example.com');
                expect(user.username).toBe('u');
            });
        });

        it('ha nincs bejelentkezett user, updateCurrentUser nem változtat állapotot', async () => {
            usersApi.getMyProfile = vi.fn();
            renderWithProvider();

            await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
            expect(screen.getByTestId('user').textContent).toBe('null');

            await act(async () => {
                screen.getByText('update').click();
            });

            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
        });
    });

    describe('useAuth hook', () => {
        it('AuthProvider nélkül dobja a hibát', () => {
            // React hibát logol a konzolra, amit el kell nyomni, hogy ne szennyezze a tesztoutputot
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
            expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
            consoleError.mockRestore();
        });
    });
});