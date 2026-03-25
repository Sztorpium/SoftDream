import * as React from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { deleteUser, getAllUsers } from "../../api/users";

export default function AdminUsersPage() {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [deletingId, setDeletingId] = React.useState(null);

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

    return (
        <Container sx={{ py: 3 }} maxWidth="md">
            <Stack spacing={2}>
                <Typography variant="h4" component="h1">
                    Admin – Users
                </Typography>

                {error ? <Alert severity="error">{error}</Alert> : null}

                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : users.length === 0 ? (
                    <Typography color="text.secondary">Nincs felhasználó.</Typography>
                ) : (
                    <Stack spacing={2}>
                        {users.map((u) => {
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

                                        {id != null ? (
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
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </Container>
    );
}