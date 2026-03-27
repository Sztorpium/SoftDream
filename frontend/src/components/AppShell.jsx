import * as React from "react";
import {
    AppBar,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Link,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

const DRAWER_WIDTH = 240;

export default function AppShell({ children }) {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();
    const isAuthenticated = Boolean(user);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    function onLogout() {
        logout();
        navigate("/login");
    }

    function handleDrawerToggle() {
        setDrawerOpen((prev) => !prev);
    }

    function handleDrawerNav(to) {
        setDrawerOpen(false);
        navigate(to);
    }

    const drawerContent = (
        <Box onClick={() => setDrawerOpen(false)} sx={{ width: DRAWER_WIDTH }}>
            <Typography variant="h6" sx={{ p: 2 }}>
                SoftDream
            </Typography>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleDrawerNav("/rooms")}>
                        <ListItemText primary="Szobák" />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => handleDrawerNav("/about")}>
                        <ListItemText primary="Rólunk" />
                    </ListItemButton>
                </ListItem>

                {isAuthenticated ? (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleDrawerNav("/my-bookings")}>
                                <ListItemText primary="Foglalásaim" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleDrawerNav("/my-reviews")}>
                                <ListItemText primary="Értékeléseim" />
                            </ListItemButton>
                        </ListItem>

                        {isAdmin ? (
                            <>
                                <Divider />
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleDrawerNav("/admin/users")}>
                                        <ListItemText primary="Admin – Felhasználók" />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => handleDrawerNav("/admin/bookings")}>
                                        <ListItemText primary="Admin – Foglalások" />
                                    </ListItemButton>
                                </ListItem>
                            </>
                        ) : null}

                        <Divider />
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    setDrawerOpen(false);
                                    onLogout();
                                }}
                            >
                                <ListItemText primary="Kilépés" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleDrawerNav("/login")}>
                                <ListItemText primary="Bejelentkezés" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => handleDrawerNav("/register")}>
                                <ListItemText primary="Regisztráció" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppBar position="static">
                <Toolbar sx={{ gap: 2 }}>
                    {/* Hamburger menu – only on small screens */}
                    <IconButton
                        color="inherit"
                        aria-label="open menu"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/rooms"
                        sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
                    >
                        SoftDream
                    </Typography>

                    {/* Desktop nav links */}
                    <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2, alignItems: "center" }}>
                        <Link
                            component={RouterLink}
                            to="/rooms"
                            color="inherit"
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                        >
                            Szobák
                        </Link>

                        <Link
                            component={RouterLink}
                            to="/about"
                            color="inherit"
                            underline="hover"
                            sx={{ fontWeight: 500 }}
                        >
                            Rólunk
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
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
                }}
            >
                {drawerContent}
            </Drawer>

            <Container component="main" maxWidth="lg" sx={{ flex: 1, py: 3 }}>
                {children}
            </Container>

            <Footer />
        </Box>
    );
}
