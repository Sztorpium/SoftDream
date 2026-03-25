import * as React from "react";
import { AppBar, Box, Button, Container, Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell({ children }) {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const isAuthenticated = Boolean(user);

    function onLogout() {
        logout();
        navigate("/login");
    }

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <AppBar position="static">
                <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        SoftDream
                    </Typography>

                    <Link
                        component={RouterLink}
                        to="/rooms"
                        color="inherit"
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                    >
                        Szobák
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                component={RouterLink}
                                to="/my-bookings"
                                color="inherit"
                                underline="hover"
                                sx={{ fontWeight: 500 }}
                            >
                                Foglalásaim
                            </Link>

                            <Link
                                component={RouterLink}
                                to="/my-reviews"
                                color="inherit"
                                underline="hover"
                                sx={{ fontWeight: 500 }}
                            >
                                Értékeléseim
                            </Link>

                            {isAdmin ? (
                                <>
                                    <Link
                                        component={RouterLink}
                                        to="/admin/users"
                                        color="inherit"
                                        underline="hover"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        Admin Users
                                    </Link>
                                    <Link
                                        component={RouterLink}
                                        to="/admin/bookings"
                                        color="inherit"
                                        underline="hover"
                                        sx={{ fontWeight: 500 }}
                                    >
                                        Admin Bookings
                                    </Link>
                                </>
                            ) : null}

                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {user?.username}
                            </Typography>

                            <Button color="inherit" size="small" onClick={onLogout}>
                                Kilépés
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link
                                component={RouterLink}
                                to="/login"
                                color="inherit"
                                underline="hover"
                                sx={{ fontWeight: 500 }}
                            >
                                Bejelentkezés
                            </Link>
                            <Link
                                component={RouterLink}
                                to="/register"
                                color="inherit"
                                underline="hover"
                                sx={{ fontWeight: 500 }}
                            >
                                Regisztráció
                            </Link>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Container component="main" maxWidth="lg">
                {children}
            </Container>
        </Box>
    );
}