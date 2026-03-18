import * as React from "react";
import {
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

export default function Login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [touched, setTouched] = React.useState({ email: false, password: false });

    const emailError = touched.email && email.trim() === "";
    const passwordError = touched.password && password.trim() === "";
    const canSubmit = email.trim() !== "" && password.trim() !== "";

    function onSubmit(e) {
        e.preventDefault();
        setTouched({ email: true, password: true });

        if (!canSubmit) return;

        // Placeholder – backend integráció később
        console.log("Login submit", { email, password });
    }

    return (
        <Container sx={{ py: 3 }} maxWidth="sm">
            <Paper sx={{ p: 3 }}>
                <Stack spacing={2} component="form" onSubmit={onSubmit} noValidate>
                    <Typography variant="h4" component="h1">
                        Bejelentkezés
                    </Typography>

                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        required
                        fullWidth
                        error={emailError}
                        helperText={emailError ? "Az email megadása kötelező." : " "}
                        autoComplete="email"
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
                    />

                    <Button type="submit" variant="contained" disabled={!canSubmit}>
                        Belépés
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}