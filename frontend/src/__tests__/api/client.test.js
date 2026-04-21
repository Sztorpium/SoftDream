import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../../api/client';

// Segédfüggvény: szintetikus fetch Response objektumot gyárt a teszteléshez.
// A valódi fetch Response-t nem tudjuk könnyen példányosítani, ezért ezt használjuk.
function makeFetchResponse({ status = 200, body = null, contentType = 'application/json' } = {}) {
    const headers = new Headers({ 'content-type': contentType });
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: String(status),
        headers,
        json: async () => body,
        text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    };
}

describe('api/client', () => {
    // Minden teszt előtt töröljük a localStorage-t és kicseréljük a globális fetch-t egy mock-ra.
    beforeEach(() => {
        localStorage.clear();
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('sikeres válasz kezelése', () => {
        it('GET kérés JSON válasszal visszaadja a body-t', async () => {
            const data = { id: 1, name: 'test' };
            fetch.mockResolvedValue(makeFetchResponse({ body: data }));

            const result = await apiGet('/api/test');
            expect(result).toEqual(data);
        });

        it('204 No Content esetén null-t ad vissza', async () => {
            fetch.mockResolvedValue(makeFetchResponse({ status: 204, body: null, contentType: '' }));

            const result = await apiDelete('/api/test/1');
            expect(result).toBeNull();
        });

        it('nem JSON válasz esetén null-t ad vissza', async () => {
            fetch.mockResolvedValue(makeFetchResponse({ body: null, contentType: 'text/plain' }));

            const result = await apiGet('/api/test');
            expect(result).toBeNull();
        });

        it('POST kérés JSON body-val és helyes Content-Type headerrel küld', async () => {
            fetch.mockResolvedValue(makeFetchResponse({ body: { ok: true } }));
            await apiPost('/api/test', { foo: 'bar' });

            // A fetch.mock.calls[0] az első hívás argumentumait tartalmazza: [url, options]
            const [, options] = fetch.mock.calls[0];
            expect(options.method).toBe('POST');
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(options.body).toBe(JSON.stringify({ foo: 'bar' }));
        });

        it('PUT, PATCH, DELETE metódusokat megfelelően küldi', async () => {
            fetch.mockResolvedValue(makeFetchResponse({ body: {} }));
            await apiPut('/api/test', { x: 1 });
            expect(fetch.mock.calls[0][1].method).toBe('PUT');

            fetch.mockResolvedValue(makeFetchResponse({ body: {} }));
            await apiPatch('/api/test', { x: 1 });
            expect(fetch.mock.calls[1][1].method).toBe('PATCH');

            fetch.mockResolvedValue(makeFetchResponse({ status: 204, body: null, contentType: '' }));
            await apiDelete('/api/test');
            expect(fetch.mock.calls[2][1].method).toBe('DELETE');
        });
    });

    describe('Authorization header', () => {
        it('ha van token a localStorage-ban, Bearer headerrel küldi', async () => {
            // A kliens minden kérés előtt a localStorage-ból olvassa ki a tokent.
            localStorage.setItem('softdream_auth', JSON.stringify({ token: 'my-jwt-token', user: {} }));
            fetch.mockResolvedValue(makeFetchResponse({ body: {} }));

            await apiGet('/api/protected');

            const [, options] = fetch.mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer my-jwt-token');
        });

        it('ha nincs token, nem kerül Authorization header a kérésbe', async () => {
            fetch.mockResolvedValue(makeFetchResponse({ body: {} }));

            await apiGet('/api/public');

            const [, options] = fetch.mock.calls[0];
            expect(options.headers['Authorization']).toBeUndefined();
        });

        it('hibás localStorage auth JSON esetén sem dob, csak token nélkül küld', async () => {
            localStorage.setItem('softdream_auth', '{broken-json');
            fetch.mockResolvedValue(makeFetchResponse({ body: {} }));

            await apiGet('/api/public');

            const [, options] = fetch.mock.calls[0];
            expect(options.headers['Authorization']).toBeUndefined();
        });
    });

    describe('base URL kezelés', () => {
        it('a VITE_API_BASE_URL végéről levágja a perjelet', async () => {
            const originalBaseUrl = import.meta.env.VITE_API_BASE_URL;
            import.meta.env.VITE_API_BASE_URL = 'http://localhost:8080/';
            fetch.mockResolvedValue(makeFetchResponse({ body: { ok: true } }));

            await apiGet('/api/test');

            expect(fetch.mock.calls[0][0]).toBe('http://localhost:8080/api/test');
            import.meta.env.VITE_API_BASE_URL = originalBaseUrl;
        });
    });

    describe('hibás válasz kezelése', () => {
        it('4xx válasz esetén Error-t dob a message mezővel', async () => {
            fetch.mockResolvedValue(
                makeFetchResponse({ status: 400, body: { message: 'Érvénytelen kérés' } })
            );

            await expect(apiPost('/api/test', {})).rejects.toThrow('Érvénytelen kérés');
        });

        it('az error objektumon szerepel a HTTP státuszkód', async () => {
            fetch.mockResolvedValue(
                makeFetchResponse({ status: 401, body: { message: 'Unauthorized' } })
            );

            let caughtError;
            try {
                await apiGet('/api/secure');
            } catch (err) {
                caughtError = err;
            }
            expect(caughtError.status).toBe(401);
        });

        it('mező-szintű validációs hibák esetén error.fields-be kerülnek', async () => {
            // A backend a mezőszintű hibákat { fieldName: "hibaüzenet" } formában adja vissza.
            // A kliens ezeket az error.fields tulajdonságba mappeli, amit az UI felhasználhat.
            fetch.mockResolvedValue(
                makeFetchResponse({
                    status: 422,
                    body: { username: 'Már foglalt!', email: 'Érvénytelen email.' },
                })
            );

            let caughtError;
            try {
                await apiPost('/api/register', {});
            } catch (err) {
                caughtError = err;
            }
            expect(caughtError.fields).toEqual({ username: 'Már foglalt!', email: 'Érvénytelen email.' });
        });

        it('nem JSON hibaválasz esetén a szöveget használja üzenetként', async () => {
            fetch.mockResolvedValue(
                makeFetchResponse({ status: 500, body: 'Internal Server Error', contentType: 'text/plain' })
            );

            await expect(apiGet('/api/test')).rejects.toThrow('Internal Server Error');
        });

        it('errors tömb esetén összefűzi az üzeneteket', async () => {
            fetch.mockResolvedValue(
                makeFetchResponse({ status: 400, body: { errors: ['Hiba1', 'Hiba2'] } })
            );

            await expect(apiPost('/api/test', {})).rejects.toThrow('Hiba1, Hiba2');
        });

        it('error mezőt is közvetlen hibaüzenetként használja', async () => {
            fetch.mockResolvedValue(
                makeFetchResponse({ status: 400, body: { error: 'Rossz kérés' } })
            );

            await expect(apiPost('/api/test', {})).rejects.toThrow('Rossz kérés');
        });
    });
});