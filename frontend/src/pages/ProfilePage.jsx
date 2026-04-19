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
import { changeMyPassword, getMyProfile, updateMyProfile, verifyMyPassword } from "../api/users";
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
    const { user, updateCurrentUser } = useAuth();
    const [profile, setProfile] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [unlockPassword, setUnlockPassword] = React.useState("");
    const [unlockError, setUnlockError] = React.useState("");
    const [unlocked, setUnlocked] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);
    const [unlocking, setUnlocking] = React.useState(false);
    const [profileForm, setProfileForm] = React.useState({
        email: "",
        phone: "",
        currentPassword: "",
    });
    const [profileEditError, setProfileEditError] = React.useState("");
    const [profileEditSuccess, setProfileEditSuccess] = React.useState("");
    const [savingProfile, setSavingProfile] = React.useState(false);
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
                if (!active) return;
                setProfile(data);
                setProfileForm((prev) => ({
                    ...prev,
                    email: data?.email ?? "",
                    phone: data?.phone ?? "",
                }));
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
            setShowDetails(true);
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

    function handleProfileEditChange(field) {
        return (e) => {
            const value = e.target.value;
            setProfileForm((prev) => ({ ...prev, [field]: value }));
            setProfileEditError("");
            setProfileEditSuccess("");
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
            setShowDetails(false);
        } catch (err) {
            setPasswordError(err?.message || "Nem sikerült módosítani a jelszót.");
        } finally {
            setChangingPassword(false);
        }
    }

    async function handleProfileSave(e) {
        e.preventDefault();
        setProfileEditError("");
        setProfileEditSuccess("");

        if (
            profileForm.email.trim() === "" ||
            profileForm.phone.trim() === "" ||
            profileForm.currentPassword.trim() === ""
        ) {
            setProfileEditError("Az emailt, a telefonszámot és a jelszót is meg kell adni.");
            return;
        }

        setSavingProfile(true);
        try {
            const updatedProfile = await updateMyProfile({
                email: profileForm.email.trim(),
                phone: profileForm.phone.trim(),
                currentPassword: profileForm.currentPassword,
            });
            setProfile(updatedProfile);
            setProfileForm((prev) => ({
                ...prev,
                email: updatedProfile?.email ?? prev.email,
                phone: updatedProfile?.phone ?? prev.phone,
                currentPassword: "",
            }));
            updateCurrentUser({ email: updatedProfile?.email, username: updatedProfile?.username });
            setProfileEditSuccess("A profiladatok sikeresen frissítve lettek.");
            setUnlockPassword("");
            setUnlocked(false);
            setShowDetails(false);
        } catch (err) {
            setProfileEditError(err?.message || "Nem sikerült frissíteni a profiladatokat.");
        } finally {
            setSavingProfile(false);
        }
    }

    const displayName = profile?.username || user?.username || "Profil";
    const initials = displayName
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .join("")
        .slice(0, 2) || "SD";
    const memberSince = profile?.createdAt ? formatDate(profile.createdAt) : "-";
    const canReveal = unlocked;
    const detailsVisible = unlocked && showDetails;

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
                        Itt látod és módosíthatod a saját fiókadataidat. A személyes adatok csak jelszó ellenőrzés után jelennek meg.
                    </Typography>

                    <Paper className={styles.identityCard}>
                        <div className={styles.identityAvatar}>{initials}</div>
                        <div>
                            <Typography variant="h6" fontWeight={800}>
                                {displayName}
                            </Typography>
                            <Typography variant="body2" className={styles.mutedText}>
                                {profile?.role ?? "USER"} fiók
                            </Typography>
                        </div>
                        <div className={styles.identityMeta}>
                            <span className={styles.metaPill}>Tag óta: {memberSince}</span>
                            <span className={styles.metaPill}>{detailsVisible ? "Privát nézet: nyitott" : "Privát nézet: zárt"}</span>
                        </div>
                    </Paper>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <Paper className={styles.heroCard}>
                    <Stack spacing={1.5}>
                        <Typography variant="h6" fontWeight={800}>
                            Profil feloldása
                        </Typography>
                        <Typography variant="body2" className={styles.mutedText}>
                            A személyes adatok megjelenítéséhez írd be a jelenlegi jelszavadat. Utána külön meg tudod mutatni vagy el tudod rejteni az adatokat.
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
                                    A jelszót biztonsági okból nem lehet megjeleníteni, de a többi adat csak feloldás után látható.
                                </Typography>
                            </Box>
                            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                                <Box className={styles.statusPill}>{detailsVisible ? "Látható" : canReveal ? "Feloldva" : "Zárolva"}</Box>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setShowDetails((prev) => !prev)}
                                    disabled={!canReveal}
                                >
                                    {detailsVisible ? "Adatok elrejtése" : "Adatok megjelenítése"}
                                </Button>
                            </Stack>
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
                                    <span className={styles.fieldValue}>{detailsVisible ? profile?.email ?? "-" : "••••••••"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Telefonszám</span>
                                    <span className={styles.fieldValue}>{detailsVisible ? profile?.phone ?? "-" : "••••••••"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Szerepkör</span>
                                    <span className={styles.fieldValue}>{profile?.role ?? "-"}</span>
                                </div>
                                <div>
                                    <span className={styles.fieldLabel}>Regisztráció ideje</span>
                                    <span className={styles.fieldValue}>{detailsVisible ? formatDate(profile?.createdAt) : "••••••••"}</span>
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
                    <Stack spacing={2} component="form" onSubmit={handleProfileSave}>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>
                                Profilbeállítások
                            </Typography>
                            <Typography variant="body2" className={styles.mutedText}>
                                Az email és telefonszám módosításához add meg a jelenlegi jelszavadat. Ez a rész a feloldás után használható.
                            </Typography>
                        </Box>

                        {profileEditError ? <Alert severity="error">{profileEditError}</Alert> : null}
                        {profileEditSuccess ? <Alert severity="success">{profileEditSuccess}</Alert> : null}

                        {unlocked ? (
                            <>
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={profileForm.email}
                                    onChange={handleProfileEditChange("email")}
                                    fullWidth
                                    autoComplete="email"
                                />
                                <TextField
                                    label="Telefonszám"
                                    type="tel"
                                    value={profileForm.phone}
                                    onChange={handleProfileEditChange("phone")}
                                    fullWidth
                                    autoComplete="tel"
                                />
                                <TextField
                                    label="Jelenlegi jelszó"
                                    type="password"
                                    value={profileForm.currentPassword}
                                    onChange={handleProfileEditChange("currentPassword")}
                                    fullWidth
                                    autoComplete="current-password"
                                />

                                <Button type="submit" variant="contained" disabled={savingProfile}>
                                    {savingProfile ? "Mentés..." : "Profil mentése"}
                                </Button>
                            </>
                        ) : (
                            <Alert severity="info">Oldd fel a profilt, hogy módosítani tudd az email címet és a telefonszámot.</Alert>
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