import * as React from "react";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = React.useState(null);

    const login = React.useCallback(async ({ email, password }) => {
        // Fake auth: csak ellenőrizzük, hogy nem üres
        if (!email || !password) {
            throw new Error("Missing credentials");
        }

        // Itt később jöhet backend hívás
        setUser({ email });
        return { email };
    }, []);

    const logout = React.useCallback(() => {
        setUser(null);
    }, []);

    const value = React.useMemo(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            login,
            logout,
        }),
        [user, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
}