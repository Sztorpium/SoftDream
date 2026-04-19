import * as React from "react";
import { Container, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
    return (
        <Container className={styles.page}>
            <Stack spacing={2} alignItems="center">
                <Typography className={styles.errorCode} aria-hidden="true">
                    404
                </Typography>
                <Typography variant="h4" component="h1" className={styles.title}>
                    Az oldal nem található
                </Typography>
                <Typography variant="body1" color="text.secondary" className={styles.subtitle}>
                    A keresett oldal nem létezik.
                </Typography>

                <Button variant="contained" component={RouterLink} to="/">
                    Vissza a kezdőlapra
                </Button>
            </Stack>
        </Container>
    );
}