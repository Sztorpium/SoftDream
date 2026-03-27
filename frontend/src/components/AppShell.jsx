import * as React from "react";
import MenuIcon from "@mui/material/Menu";
import {
    AppBar,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    Link,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

function NavLink({ to, children, onClick, admin }) {
    return (
        <Link
            component={RouterLink}
            to={to}
            underline="hover"
            onClick={onClick}
            sx={{ fontWeight: 600, color: admin ? "error.main" : "inherit" }}
        >
            {children}
        </Link>
    );
}

export default function AppShell({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAdmin, logout } = useAuth();

    const isAuthenticated = Boolean(user);
    const [open, setOpen] = React.useState(false);

    function onLogout() {
        logout();
        navigate("/login");
    }

    const commonLinks = [
        { label: "Szobák", to: "/rooms" },
        { label: "About", to: "/about" },
    ];

    const authedLinks = [
        { label: "Foglalásaim", to: "/my-bookings" },
        { label: "Értékeléseim", to: "/my-reviews" },
    ];

    const adminLinks = [
        { label: "Admin Users", to: "/admin/users", admin: true },
        { label: "Admin Bookings", to: "/admin/bookings", admin: true },
    ];

    const guestLinks = [
        { label: "Bejelentkezés", to: "/login" },
        { label: "Regisztráció", to: "/register" },
    ];

    const drawerLinks = [
        ...commonLinks,
        ...(isAuthenticated ? authedLinks : guestLinks),
        ...(isAuthenticated && isAdmin ? adminLinks : []),
    ];

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(255,255,255,0.18)" }}>
                <Toolbar sx={{ gap: 2 }}>
                    {/* Mobile hamburger */}
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setOpen(true)}
                        sx={{ display: { xs: "inline-flex", md: "none" } }}
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/rooms"
                        style={{ color: "inherit", textDecoration: "none" }}
                        sx={{ fontWeight: 900, letterSpacing: 0.2 }}
                    >
                        SoftDream
                    </Typography>

                    {/* Desktop links */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, ml: 2, flexGrow: 1 }}>
                        {commonLinks.map((l) => (
                            <NavLink key={l.to} to={l.to}>
                                {l.label}
                            </NavLink>
                        ))}

                        {isAuthenticated ? (
                            <>
                                {authedLinks.map((l) => (
                                    <NavLink key={l.to} to={l.to}>
                                        {l.label}
                                    </NavLink>
                                ))}
                                {isAdmin ? (
                                    <>
                                        {adminLinks.map((l) => (
                                            <NavLink key={l.to} to={l.to} admin={l.admin}>
                                                {l.label}
                                            </NavLink>
                                        ))}
                                    </>
                                ) : null}
                            </>
                        ) : null}
                    </Box>

                    {/* Right side */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
                        {isAuthenticated ? (
                            <>
                                <Typography variant="body2" sx={{ opacity: 0.9, display: { xs: "none", sm: "block" } }}>
                                    {user?.username}
                                </Typography>
                                <Button color="inherit" size="small" onClick={onLogout}>
                                    Kilépés
                                </Button>
                            </>
                        ) : (
                            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                                <Button
                                    component={RouterLink}
                                    to="/login"
                                    color="inherit"
                                    size="small"
                                    variant={location.pathname === "/login" ? "outlined" : "text"}
                                    sx={{ borderColor: "rgba(255,255,255,0.6)" }}
                                >
                                    Bejelentkezés
                                </Button>
                                <Button
                                    component={RouterLink}
                                    to="/register"
                                    color="inherit"
                                    size="small"
                                    variant={location.pathname === "/register" ? "outlined" : "text"}
                                    sx={{ borderColor: "rgba(255,255,255,0.6)" }}
                                >
                                    Regisztráció
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 280 }} role="presentation">
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900 }}>
                            Menü
                        </Typography>
                        {isAuthenticated ? (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                {user?.username}
                            </Typography>
                        ) : (
                            <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                Vendég
                            </Typography>
                        )}
                    </Box>
                    <Divider />
                    <List>
                        {drawerLinks.map((l) => (
                            <ListItemButton
                                key={l.to}
                                component={RouterLink}
                                to={l.to}
                                onClick={() => setOpen(false)}
                                sx={l.admin ? { color: "error.main" } : undefined}
                            >
                                <ListItemText primary={l.label} />
                            </ListItemButton>
                        ))}
                    </List>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                        {isAuthenticated ? (
                            <Button fullWidth variant="outlined" color="error" onClick={() => { setOpen(false); onLogout(); }}>
                                Kilépés
                            </Button>
                        ) : null}
                    </Box>
                </Box>
            </Drawer>

            {/* Main content */}
            <Box sx={{ flexGrow: 1 }}>
                {children}
            </Box>

            <Footer />
        </Box>
    );
}