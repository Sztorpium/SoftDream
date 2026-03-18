import * as React from "react";
import * as authApi from "../api/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const AuthContext = React.createContext(null);

function loadStoredUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = React.useState(loadStoredUser);

    const persistAuth = React.useCallback((authResponse) => {
        localStorage.setItem(TOKEN_KEY, authResponse.token);
        const userInfo = {
            userId: authResponse.userId,
            username: authResponse.username,
            email: authResponse.email,
            role: authResponse.role,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
        setUser(userInfo);
        return userInfo;
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

    const logout = React.useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);

    const value = React.useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            login,
            register,
            logout,
        }),
        [user, login, register, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}