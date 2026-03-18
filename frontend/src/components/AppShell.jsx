import * as React from "react";
import { AppBar, Box, Button, Container, Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AppShell({ children }) {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <Box sx={{ minHeight: "100vh" }}>
            <AppBar position="static">
                <Toolbar sx={{ gap: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        SoftDream
                    </Typography>

                    <Link
                        component={RouterLink}
                        to="/"
                        color="inherit"
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                    >
                        Home
                    </Link>

                    {!isAuthenticated ? (
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
                    ) : (
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
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {user?.username}
                            </Typography>
                            <Button color="inherit" size="small" onClick={logout}>
                                Kilépés
                            </Button>
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