import * as React from "react";
import { Box, Container, Typography } from "@mui/material";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <Box component="footer" className={styles.footer}>
            <Container>
                <Typography variant="body2" className={styles.footerText}>
                    © {new Date().getFullYear()} SoftDream — Hotel booking demo
                </Typography>
            </Container>
        </Box>
    );
}