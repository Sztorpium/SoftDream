import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, register, logout } from '../../api/auth';
import { apiPost } from '../../api/client';

vi.mock('../../api/client', () => ({
    apiPost: vi.fn(),
}));

describe('api/auth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('login a helyes auth végpontra küld', async () => {
        const credentials = { username: 'user1', password: 'secret' };
        apiPost.mockResolvedValue({ token: 'tok' });

        await login(credentials);

        expect(apiPost).toHaveBeenCalledWith('/api/auth/login', credentials);
    });

    it('register a helyes auth végpontra küld', async () => {
        const payload = {
            username: 'user1',
            email: 'user@example.com',
            phone: '06301234567',
            password: 'secret',
        };
        apiPost.mockResolvedValue({ token: 'tok' });

        await register(payload);

        expect(apiPost).toHaveBeenCalledWith('/api/auth/register', payload);
    });

    it('logout üres body-val hívja a logout végpontot', async () => {
        apiPost.mockResolvedValue(null);

        await logout();

        expect(apiPost).toHaveBeenCalledWith('/api/auth/logout', {});
    });
});