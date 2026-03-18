import * as React from "react";
import { AppBar, Box, Container, Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function AppShell({ children }) {
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

                    <Link
                        component={RouterLink}
                        to="/about"
                        color="inherit"
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                    >
                        About
                    </Link>

                    <Link
                        component={RouterLink}
                        to="/login"
                        color="inherit"
                        underline="hover"
                        sx={{ fontWeight: 500 }}
                    >
                        Bejelentkezés
                    </Link>
                </Toolbar>
            </AppBar>

            <Container component="main" maxWidth="lg">
                {children}
            </Container>
        </Box>
    );
}