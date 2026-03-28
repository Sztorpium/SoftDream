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
        <Container sx={{ py: 3 }} maxWidth="md">
            <Stack spacing={2}>
                <Typography variant="h4" component="h1">
                    Admin – Users
                </Typography>

                <TextField
                    placeholder="Keresés: id, név, e-mail, státusz..."
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredUsers.length === 0 ? (
                    <Typography color="text.secondary">
                        {search ? "Nincs találat." : "Nincs felhasználó."}
                    </Typography>
                ) : (
                    <Stack spacing={2}>
                        {filteredUsers.map((u) => {
                            const id = u.id ?? u.userId;
                            return (
                                <Paper key={id ?? JSON.stringify(u)} sx={{ p: 2 }}>
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                        gap={1}
                                    >
                                        <Box>
                                            <Typography fontWeight={800}>
                                                {u.username ?? "—"}{" "}
                                                <Typography component="span" sx={{ opacity: 0.7 }}>
                                                    #{id ?? "?"}
                                                </Typography>
                                            </Typography>
                                            {u.email ? (
                                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                    {u.email}
                                                </Typography>
                                            ) : null}
                                            {u.role ? (
                                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                                    Role: {u.role}
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