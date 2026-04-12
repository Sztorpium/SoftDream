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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Register.module.css";

export default function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = React.useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });
    const [touched, setTouched] = React.useState({
        username: false,
        email: false,
        phone: false,
        password: false,
    });
    const [submitError, setSubmitError] = React.useState("");
    const [serverFieldErrors, setServerFieldErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    function handleChange(field) {
        return (e) => {
            setForm((f) => ({ ...f, [field]: e.target.value }));
            setServerFieldErrors((prev) => {
                if (!prev[field]) return prev;
                return { ...prev, [field]: undefined };
            });
        };
    }

    function handleBlur(field) {
        return () => setTouched((t) => ({ ...t, [field]: true }));
    }

    const errors = {
        username: touched.username && form.username.trim() === "",
        email: touched.email && form.email.trim() === "",
        phone: touched.phone && form.phone.trim() === "",
        password: touched.password && form.password.trim() === "",
    };

    async function onSubmit(e) {
        e.preventDefault();
        setSubmitError("");
        setServerFieldErrors({});
        setTouched({ username: true, email: true, phone: true, password: true });

        if (
            form.username.trim() === "" ||
            form.email.trim() === "" ||
            form.phone.trim() === "" ||
            form.password.trim() === ""
        ) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                username: form.username.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                password: form.password,
            };
            await register(payload);
            navigate("/", { replace: true });
        } catch (err) {
            setServerFieldErrors(err?.fields ?? {});
            setSubmitError(err?.message || "Sikertelen regisztráció.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Container className={styles.page} maxWidth="sm">
            <Paper className={styles.formPaper}>
                <Stack spacing={2} component="form" onSubmit={onSubmit} noValidate>
                    <Typography variant="h4" component="h1" className={styles.title}>
                        Regisztráció
                    </Typography>

                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}

                    <TextField
                        label="Felhasználónév"
                        type="text"
                        value={form.username}
                        onChange={handleChange("username")}
                        onBlur={handleBlur("username")}
                        required
                        fullWidth
                        error={errors.username || Boolean(serverFieldErrors.username)}
                        helperText={
                            serverFieldErrors.username ||
                            (errors.username ? "A felhasználónév megadása kötelező." : " ")
                        }
                        autoComplete="username"
                        inputProps={{ "aria-label": "username" }}
                    />

                    <TextField
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        onBlur={handleBlur("email")}
                        required
                        fullWidth
                        error={errors.email || Boolean(serverFieldErrors.email)}
                        helperText={
                            serverFieldErrors.email ||
                            (errors.email ? "Az email megadása kötelező." : " ")
                        }
                        autoComplete="email"
                        inputProps={{ "aria-label": "email" }}
                    />

                    <TextField
                        label="Telefonszám"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange("phone")}
                        onBlur={handleBlur("phone")}
                        required
                        fullWidth
                        error={errors.phone || Boolean(serverFieldErrors.phone)}
                        helperText={
                            serverFieldErrors.phone ||
                            (errors.phone ? "A telefonszám megadása kötelező." : " ")
                        }
                        autoComplete="tel"
                        inputProps={{ "aria-label": "phone" }}
                    />

                    <TextField
                        label="Jelszó"
                        type="password"
                        value={form.password}
                        onChange={handleChange("password")}
                        onBlur={handleBlur("password")}
                        required
                        fullWidth
                        error={errors.password || Boolean(serverFieldErrors.password)}
                        helperText={
                            serverFieldErrors.password ||
                            (errors.password ? "A jelszó megadása kötelező." : " ")
                        }
                        autoComplete="new-password"
                        inputProps={{ "aria-label": "password" }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Regisztráció..." : "Regisztráció"}
                    </Button>

                    <Typography variant="body2" align="center">
                        Már van fiókod?{" "}
                        <Link component={RouterLink} to="/login">
                            Jelentkezz be
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Container>
    );
}