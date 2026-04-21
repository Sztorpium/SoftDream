import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Az AuthContext mock-olásával elkerüljük a valódi Provider és localStorage
// függőségeket – csak a route logikára koncentrálunk.
vi.mock('../../context/AuthContext');

function renderProtected({ user = null, loading = false } = {}) {
    useAuth.mockReturnValue({ user, loading });

    render(
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route element={<ProtectedRoute />}>
                    <Route path="/protected" element={<div>Védett tartalom</div>} />
                </Route>
                <Route path="/login" element={<div>Login oldal</div>} />
            </Routes>
        </MemoryRouter>
    );
}

describe('ProtectedRoute', () => {
    it('bejelentkezett felhasználónak megmutatja a tartalmát', () => {
        renderProtected({ user: { userId: 1, username: 'tester' } });
        expect(screen.getByText('Védett tartalom')).toBeInTheDocument();
    });

    it('be nem jelentkezett felhasználót /login-ra irányít', () => {
        renderProtected({ user: null });
        expect(screen.getByText('Login oldal')).toBeInTheDocument();
        expect(screen.queryByText('Védett tartalom')).not.toBeInTheDocument();
    });

    it('betöltés közben semmit sem renderel', () => {
        renderProtected({ user: null, loading: true });
        expect(screen.queryByText('Védett tartalom')).not.toBeInTheDocument();
        expect(screen.queryByText('Login oldal')).not.toBeInTheDocument();
    });
});