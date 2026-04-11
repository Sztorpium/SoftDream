/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import * as authApi from "../api/auth";

const STORAGE_KEY = "softdream_auth";

const AuthContext = React.createContext(null);

/** Decode the JWT payload and return the expiry timestamp in ms, or 0 on error. */
function getTokenExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
    } catch {
        return 0;
    }
}

function isTokenExpired(token) {
    if (!token) return true;
    const expiry = getTokenExpiry(token);
    return expiry > 0 && Date.now() >= expiry;
}

function loadStoredAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { token: null, user: null };
        const parsed = JSON.parse(raw);
        const token = parsed?.token ?? null;
        // Clear expired tokens immediately
        if (isTokenExpired(token)) {
            localStorage.removeItem(STORAGE_KEY);
            return { token: null, user: null };
        }
        return {
            token,
            user: parsed?.user ?? null,
        };
    } catch {
        return { token: null, user: null };
    }
}

export function AuthProvider({ children }) {
    const [{ token, user }, setAuth] = React.useState(() => loadStoredAuth());
    const [loading, setLoading] = React.useState(true);

    const logout = React.useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuth({ token: null, user: null });
    }, []);

    React.useEffect(() => {
        // Sync from localStorage and drop expired tokens on mount
        setAuth(loadStoredAuth());
        setLoading(false);
    }, []);

    // Listen for 401 responses dispatched by the API client
    React.useEffect(() => {
        window.addEventListener("auth:unauthorized", logout);
        return () => window.removeEventListener("auth:unauthorized", logout);
    }, [logout]);

    const isAdmin = user?.role === "ADMIN";

    const persistAuth = React.useCallback((authResponse) => {
        const userInfo = {
            userId: authResponse.userId,
            username: authResponse.username,
            email: authResponse.email,
            role: authResponse.role,
        };

        const nextAuth = { token: authResponse.token, user: userInfo };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
        setAuth(nextAuth);
        return nextAuth;
    }, []);

    const login = React.useCallback(
        async ({ username, password }) => {
            const response = await authApi.login({ username, password });
            return persistAuth(response);
        },
        [persistAuth]
    );

    const register = React.useCallback(
        async ({ username, email, phone, password }) => {
            const response = await authApi.register({ username, email, phone, password });
            return persistAuth(response);
        },
        [persistAuth]
    );

    const value = React.useMemo(
        () => ({
            user,
            token,
            isAdmin,
            loading,
            login,
            register,
            logout,
        }),
        [user, token, isAdmin, loading, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}