import * as React from "react";
import { Container, Typography } from "@mui/material";
import styles from "./Home.module.css";

export default function Home() {
    return (
        <Container className={styles.page}>
            <Typography variant="h4" component="h1" className={styles.title} gutterBottom>
                Home
            </Typography>
            <Typography variant="body1" color="text.secondary" className={styles.subtitle}>
                Welcome to SoftDream frontend.
            </Typography>
        </Container>
    );
}