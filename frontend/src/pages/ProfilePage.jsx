import * as React from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, getMyProfile, verifyMyPassword } from "../api/users";
import styles from "./ProfilePage.module.css";

function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("hu-HU", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [unlockPassword, setUnlockPassword] = React.useState("");
    const [unlockError, setUnlockError] = React.useState("");
    const [unlocked, setUnlocked] = React.useState(false);
    const [unlocking, setUnlocking] = React.useState(false);
    const [passwordForm, setPasswordForm] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = React.useState("");
    const [passwordSuccess, setPasswordSuccess] = React.useState("");
    const [changingPassword, setChangingPassword] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const data = await getMyProfile();
                if (active) setProfile(data);
            } catch (err) {
                if (active) setError(err?.message || "Nem sikerült betölteni a profilt.");
            } finally {
                if (active) setLoading(false);
            }
        }

        load();
        return () => {
            active = false;
        };
    }, []);

    async function handleUnlock(e) {
        e.preventDefault();
        setUnlockError("");
        setUnlocking(true);
        try {
            await verifyMyPassword(unlockPassword);
            setUnlocked(true);
        } catch (err) {
            setUnlockError(err?.message || "Nem sikerült ellenőrizni a jelszót.");
        } finally {
            setUnlocking(false);
        }
    }

    function handlePasswordChange(field) {
        return (e) => {
            const value = e.target.value;
            setPasswordForm((prev) => ({ ...prev, [field]: value }));
            setPasswordError("");
            setPasswordSuccess("");
        };
    }

    async function handlePasswordSubmit(e) {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (
            passwordForm.currentPassword.trim() === "" ||
            passwordForm.newPassword.trim() === "" ||
            passwordForm.confirmPassword.trim() === ""
        ) {
            setPasswordError("Minden jelszó mezőt ki kell tölteni.");
            return;
        }

        setChangingPassword(true);
        try {
            await changeMyPassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword,
            });
            setPasswordSuccess("A jelszó sikeresen módosítva.");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setUnlockPassword("");
            setUnlocked(false);
        } catch (err) {
            setPasswordError(err?.message || "Nem sikerült módosítani a jelszót.");
        } finally {
            setChangingPassword(false);
        }
    }

    const displayName = profile?.username || user?.username || "Profil";

    return (
        <Container className={styles.page} maxWidth="lg">
            <Stack spacing={3} className={styles.content}>
                <Box className={styles.headerBlock}>
                    <Typography variant="overline" className={styles.kicker}>
                        Saját fiók
                    </Typography>
                    <Typography variant="h3" component="h1">
                        {displayName}
                    </Typography>
                    <Typography className={styles.lead}>
                        Itt látod a saját fiókadataidat, és innen tudod a jelszavadat is biztonságosan módosítani.
                    </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Paper className={styles.heroCard}>
                    <Stack spacing={1.5}>
                        <Typography variant="h6" fontWeight={800}>
                            Profil feloldása
                        </Typography>
                        <Typography variant="body2" className={styles.mutedText}>
                            A személyes adatok megjelenítéséhez írd be a jelenlegi jelszavadat. A jelszavadat soha nem jelenítjük meg, csak a hozzáférést ellenőrizzük.
                        </Typography>

                        <Box component="form" onSubmit={handleUnlock} className={styles.unlockForm}>
                            <TextField
                                label="Jelenlegi jelszó"
                                type="password"
                                value={unlockPassword}
                                onChange={(e) => setUnlockPassword(e.target.value)}
                                fullWidth
                                autoComplete="current-password"
                            />
                            <Button type="submit" variant="contained" disabled={unlocking}>
                                {unlocking ? "Ellenőrzés..." : unlocked ? "Újraellenőrzés" : "Profil feloldása"}
                            </Button>
                        </Box>
                        {unlockError ? <Alert severity="error">{unlockError}</Alert> : null}
                    </Stack>
                </Paper>

                <Paper className={styles.profileCard}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
                            <Box>
                                <Typography variant="h6" fontWeight={800}>
                                    Fiókadatok
                                </Typography>
                                <Typography variant="body2" className={styles.mutedText}>
                                    A jelszót biztonsági okból nem lehet megjeleníteni, de a többi adat az ellenőrzés után látható.
                                </Typography>
                            </Box>
                            <Box className={styles.statusPill}>{unlocked ? "Feloldva" : "Zárolva"}</Box>
                        </Stack>

                        <Divider />

                        {loading ? (
                            <Typography className={styles.mutedText}>Profil betöltése...</Typography>
                        ) : (
                            <Box className={styles.grid}>
                                <div>
                                    <span className={styles.fieldLabel}>Felhasználónév</span>
                                    <span className={styles.fieldValue}>{profile?.username ?? "-"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Email</span>
                                    <span className={styles.fieldValue}>{unlocked ? profile?.email ?? "-" : "••••••••"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Telefonszám</span>
                                    <span className={styles.fieldValue}>{unlocked ? profile?.phone ?? "-" : "••••••••"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Szerepkör</span>
                                    <span className={styles.fieldValue}>{profile?.role ?? "-"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Regisztráció ideje</span>
                                    <span className={styles.fieldValue}>{unlocked ? formatDate(profile?.createdAt) : "••••••••"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Jelszó</span>
                                    <span className={styles.fieldValue}>Nem jeleníthető meg, csak módosítható.</span>
                                </div>
                            </Box>
                        )}
                    </Stack>
                </Paper>

                <Paper className={styles.profileCard}>
                    <Stack spacing={2} component="form" onSubmit={handlePasswordSubmit}>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>
                                Jelszó módosítása
                            </Typography>
                            <Typography variant="body2" className={styles.mutedText}>
                                Add meg a jelenlegi jelszavadat, majd az újat kétszer.
                            </Typography>
                        </Box>

                        {passwordError ? <Alert severity="error">{passwordError}</Alert> : null}
                        {passwordSuccess ? <Alert severity="success">{passwordSuccess}</Alert> : null}

                        <TextField
                            label="Jelenlegi jelszó"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange("currentPassword")}
                            fullWidth
                            autoComplete="current-password"
                        />
                        <TextField
                            label="Új jelszó"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange("newPassword")}
                            fullWidth
                            autoComplete="new-password"
                        />
                        <TextField
                            label="Új jelszó megerősítése"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange("confirmPassword")}
                            fullWidth
                            autoComplete="new-password"
                        />

                        <Button type="submit" variant="contained" disabled={changingPassword}>
                            {changingPassword ? "Módosítás..." : "Jelszó módosítása"}
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}