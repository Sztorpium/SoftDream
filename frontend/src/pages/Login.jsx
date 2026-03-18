import * as React from "react";
import {
    Alert,
    Button,
    Container,
    Link,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [touched, setTouched] = React.useState({ username: false, password: false });
    const [submitError, setSubmitError] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const usernameTrimmed = username.trim();
    const usernameError = touched.username && usernameTrimmed === "";
    const passwordError = touched.password && password.trim() === "";

    const from = location.state?.from?.pathname || "/";

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitError("");
        setTouched({ username: true, password: true });

        if (usernameTrimmed === "" || password.trim() === "") return;

        setIsSubmitting(true);
        try {
            await login({ username: usernameTrimmed, password });
            navigate(from, { replace: true });
        } catch (err) {
            setSubmitError(err?.message || "Sikertelen bejelentkezés.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="sm">
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2} component="form" onSubmit={onSubmit} noValidate>
                    <Typography variant="h4" component="h1">
                        Bejelentkezés
                    </Typography>

                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <TextField
                        label="Felhasználónév"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, username: true }))}
                        required
                        fullWidth
                        error={usernameError}
                        helperText={usernameError ? "A felhasználónév megadása kötelező." : " "}
                        autoComplete="username"
                        inputProps={{ "aria-label": "username" }}
                    />

                    <TextField
                        label="Jelszó"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                        required
                        fullWidth
                        error={passwordError}
                        helperText={passwordError ? "A jelszó megadása kötelező." : " "}
                        autoComplete="current-password"
                        inputProps={{ "aria-label": "password" }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Beléptetés..." : "Belépés"}
                    </Button>

                    <Typography variant="body2" align="center">
                        Még nincs fiókod?{" "}
                        <Link component={RouterLink} to="/register">
                            Regisztrálj
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}