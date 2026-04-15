/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import * as authApi from "../api/auth";
import * as usersApi from "../api/users";

const STORAGE_KEY = "softdream_auth";

const AuthContext = React.createContext(null);

function loadStoredAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { token: null, user: null };
        const parsed = JSON.parse(raw);
        return {
            token: parsed?.token ?? null,
            user: parsed?.user ?? null,
        };
    } catch {
        return { token: null, user: null };
    }
}

export function AuthProvider({ children }) {
    const [{ token, user }, setAuth] = React.useState(() => loadStoredAuth());
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // ensure we sync from localStorage once on mount
        const storedAuth = loadStoredAuth();
        setAuth(storedAuth);

        // If user is logged in, fetch fresh user data from backend
        if (storedAuth.token) {
            usersApi
                .getMyProfile()
                .then((freshUser) => {
                    // Update auth with fresh user data from backend
                    const nextAuth = {
                        token: storedAuth.token,
                        user: {
                            userId: freshUser.userId || freshUser.id,
                            username: freshUser.username,
                            email: freshUser.email,
                            role: freshUser.role,
                        },
                    };
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
                    setAuth(nextAuth);
                })
                .catch((error) => {
                    console.warn("Failed to sync user from backend:", error);
                    // Keep the stored auth as fallback
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

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

    const updateCurrentUser = React.useCallback((updates) => {
        setAuth((prev) => {
            if (!prev.user) return prev;

            const nextAuth = {
                ...prev,
                user: {
                    ...prev.user,
                    ...updates,
                },
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
            return nextAuth;
        });
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

    const logout = React.useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Ha a backend hívás nem sikerül (pl. token lejárt vagy 403-as), 
            // a helyi állapotot akkor is töröljük
            console.warn("Backend logout failed:", error);
        } finally {
            localStorage.removeItem(STORAGE_KEY);
            setAuth({ token: null, user: null });
        }
    }, []);

    const value = React.useMemo(
        () => ({
            user,
            token,
            isAdmin,
            loading,
            login,
            register,
            logout,
            updateCurrentUser,
        }),
        [user, token, isAdmin, loading, login, register, logout, updateCurrentUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}