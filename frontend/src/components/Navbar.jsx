import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = {
    bar: {
        background: "#1a1a2e",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 10,
    },
    left: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
    },
    right: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
        justifyContent: "flex-end",
    },
    brand: {
        fontWeight: 800,
        letterSpacing: 0.5,
        color: "white",
        textDecoration: "none",
    },
    link: {
        color: "white",
        textDecoration: "none",
        fontWeight: 500,
        opacity: 0.9,
    },
    accentLink: {
        color: "#e94560",
        textDecoration: "none",
        fontWeight: 700,
    },
    button: {
        background: "transparent",
        border: "1px solid #e94560",
        color: "#e94560",
        padding: "6px 10px",
        borderRadius: 8,
        cursor: "pointer",
        fontWeight: 700,
    },
    username: {
        opacity: 0.9,
        fontSize: 14,
    },
};

export default function Navbar() {
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();

    function onLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav style={styles.bar}>
            <div style={styles.left}>
                <Link to="/" style={styles.brand}>
                    SoftDream
                </Link>
                <Link to="/rooms" style={styles.link}>
                    Rooms
                </Link>

                {user ? (
                    <>
                        <Link to="/my-bookings" style={styles.link}>
                            My Bookings
                        </Link>
                        <Link to="/my-reviews" style={styles.link}>
                            My Reviews
                        </Link>

                        {isAdmin ? (
                            <>
                                <Link to="/admin/users" style={styles.accentLink}>
                                    Admin: Users
                                </Link>
                                <Link to="/admin/bookings" style={styles.accentLink}>
                                    Admin: Bookings
                                </Link>
                            </>
                        ) : null}
                    </>
                ) : null}
            </div>

            <div style={styles.right}>
                {!user ? (
                    <>
                        <Link to="/login" style={styles.link}>
                            Login
                        </Link>
                        <Link to="/register" style={styles.accentLink}>
                            Register
                        </Link>
                    </>
                ) : (
                    <>
                        <span style={styles.username}>{user.username}</span>
                        <button type="button" onClick={onLogout} style={styles.button}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}