import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getAllUsers,
    getUserById,
    getUserByUsername,
    getMyProfile,
    verifyMyPassword,
    changeMyPassword,
    updateMyProfile,
    deleteUser,
} from '../../api/users';
import { apiDelete, apiGet, apiPost, apiPut } from '../../api/client';

vi.mock('../../api/client', () => ({
    apiGet: vi.fn(),
    apiPost: vi.fn(),
    apiPut: vi.fn(),
    apiDelete: vi.fn(),
}));

describe('api/users', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getAllUsers tömb payloadot változtatás nélkül ad vissza', async () => {
        const users = [{ id: 1 }, { id: 2 }];
        apiGet.mockResolvedValue(users);

        const result = await getAllUsers();

        expect(apiGet).toHaveBeenCalledWith('/api/users');
        expect(result).toEqual(users);
    });

    it('getAllUsers lapozott payloadból a content tömböt adja vissza', async () => {
        const users = [{ id: 1 }];
        apiGet.mockResolvedValue({ content: users });

        const result = await getAllUsers();

        expect(result).toEqual(users);
    });

    it('getAllUsers nem tömb payloadnál üres tömböt ad vissza', async () => {
        apiGet.mockResolvedValue({ foo: 'bar' });

        const result = await getAllUsers();

        expect(result).toEqual([]);
    });

    it('getUserById a helyes URL-re kér le', async () => {
        apiGet.mockResolvedValue({ id: 42 });
        await getUserById(42);
        expect(apiGet).toHaveBeenCalledWith('/api/users/42');
    });

    it('getUserByUsername URL-encode-olja a felhasználónevet', async () => {
        apiGet.mockResolvedValue({ username: 'john doe' });
        await getUserByUsername('john doe');
        expect(apiGet).toHaveBeenCalledWith('/api/users/username/john%20doe');
    });

    it('getMyProfile a /me végpontot hívja', async () => {
        apiGet.mockResolvedValue({ id: 1 });
        await getMyProfile();
        expect(apiGet).toHaveBeenCalledWith('/api/users/me');
    });

    it('verifyMyPassword body-ban küldi a jelszót', async () => {
        apiPost.mockResolvedValue({ valid: true });
        await verifyMyPassword('pw');
        expect(apiPost).toHaveBeenCalledWith('/api/users/me/verify-password', { password: 'pw' });
    });

    it('changeMyPassword a helyes végpontot használja', async () => {
        const payload = { oldPassword: 'old', newPassword: 'new' };
        apiPut.mockResolvedValue({ ok: true });
        await changeMyPassword(payload);
        expect(apiPut).toHaveBeenCalledWith('/api/users/me/password', payload);
    });

    it('updateMyProfile a helyes végpontot használja', async () => {
        const payload = { email: 'new@example.com' };
        apiPut.mockResolvedValue({ ok: true });
        await updateMyProfile(payload);
        expect(apiPut).toHaveBeenCalledWith('/api/users/me', payload);
    });

    it('deleteUser a felhasználó azonosítójával töröl', async () => {
        apiDelete.mockResolvedValue(null);
        await deleteUser(9);
        expect(apiDelete).toHaveBeenCalledWith('/api/users/9');
    });
});