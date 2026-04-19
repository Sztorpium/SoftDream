import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { deleteUser, getAllUsers } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { translateRole } from "../../utils/displayText";
import styles from "./AdminUsersPage.module.css";

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [deletingId, setDeletingId] = React.useState(null);
    const [search, setSearch] = React.useState("");

    const load = React.useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err?.message || "Nem sikerült betölteni a felhasználókat.");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    async function onDelete(userId, username) {
        const ok = window.confirm(
            `Biztosan törlöd ezt a felhasználót?${username ? ` (${username})` : ""}`
        );
        if (!ok) return;

        setDeletingId(userId);
        setError("");
        try {
            await deleteUser(userId);
            await load();
        } catch (err) {
            setError(err?.message || "Nem sikerült törölni a felhasználót.");
        } finally {
            setDeletingId(null);
        }
    }

    const filteredUsers = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter((u) => {
            const id = String(u.id ?? u.userId ?? "");
            const name = (u.username ?? "").toLowerCase();
            const email = (u.email ?? "").toLowerCase();
            const role = (u.role ?? "").toLowerCase();
            return (
                id.includes(q) ||
                name.includes(q) ||
                email.includes(q) ||
                role.includes(q)
            );
        });
    }, [users, search]);

    function canDelete(u) {
        const id = u.id ?? u.userId;
        if (id == null) return false;
        if (Number(id) === Number(currentUser?.userId)) return false;
        if ((u.role ?? "").toUpperCase() === "ADMIN") return false;
        return true;
    }

    return (
        <Container className={styles.page} maxWidth="lg">
            <Stack spacing={2} className={styles.content}>
                <div>
                    <span className={styles.adminBadge}>Admin</span>
                </div>
                <Typography variant="h4" component="h1">
                    Admin - Felhasználók
                </Typography>

                <TextField
                    placeholder="Keresés: id, név, e-mail, státusz..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box className={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : filteredUsers.length === 0 ? (
                    <Typography color="text.secondary">
                        {search ? "Nincs találat." : "Nincs felhasználó."}
                    </Typography>
                ) : (
                    <Stack spacing={2} className={styles.list}>
                        {filteredUsers.map((u) => {
                            const id = u.id ?? u.userId;
                            return (
                                <Paper key={id ?? JSON.stringify(u)} className={styles.userCard}>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                        gap={1}
                                    >
                                        <Box>
                                            <Typography fontWeight={800}>
                                                {u.username ?? "—"}{" "}
                                                <Typography component="span" className={styles.userIdText}>
                                                    #{id ?? "?"}
                                                </Typography>
                                            </Typography>
                                            {u.email ? (
                                                <Typography variant="body2" className={styles.userMeta}>
                                                    {u.email}
                                                </Typography>
                                            ) : null}
                                            {u.role ? (
                                                <Typography variant="body2" className={styles.userMeta}>
                                                    Szerepkör: {translateRole(u.role)}
                                                </Typography>
                                            ) : null}
                                        </Box>

                                        <Stack direction="row" gap={1}>
                                            {id != null && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => navigate(`/admin/users/${id}`)}
                                                >
                                                    Részletek
                                                </Button>
                                            )}
                                            {canDelete(u) ? (
                                                <Button
                                                    color="error"
                                                    size="small"
                                                    onClick={() => onDelete(id, u.username)}
                                                    disabled={deletingId === id}
                                                >
                                                    {deletingId === id ? "Törlés..." : "Törlés"}
                                                </Button>
                                            ) : null}
                                        </Stack>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}