/**
 * Usage:
 *  <Loading />
 *  <Loading label="Betöltés..." />
 */

import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading({ label = "Betöltés..." }) {
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{
                minHeight: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1.5,
            }}
        >
            <CircularProgress />
            {label ? (
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            ) : null}
        </Box>
    );
}