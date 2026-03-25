/**
 * ErrorAlert – egységes hibamegjelenítés.
 *
 * Usage:
 *  <ErrorAlert message="Nem sikerült betölteni az adatokat." />
 *
 *  <ErrorAlert
 *    severity="warning"
 *    title="Figyelem"
 *    message="A foglalás még nincs megerősítve."
 *  />
 *
 *  <ErrorAlert
 *    title="Hiba"
 *    message="Szerver hiba történt."
 *    details={error?.stack}
 *    onRetry={() => refetch()}
 *  />
 */

import * as React from "react";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Collapse,
    Typography,
} from "@mui/material";

const DEFAULT_MESSAGE = "Ismeretlen hiba történt.";

export default function ErrorAlert({
    title,
    message,
    severity = "error",
    details,
    onRetry,
}) {
    const safeMessage =
        message === null || message === undefined || message === ""
            ? DEFAULT_MESSAGE
            : message;

    const hasDetails = !(details === null || details === undefined || details === "");
    const [showDetails, setShowDetails] = React.useState(false);

    return (
        <Alert
            severity={severity}
            role="alert"
            aria-live="polite"
            sx={{ alignItems: "flex-start" }}
            action={
                onRetry ? (
                    <Button
                        color="inherit"
                        size="small"
                        onClick={onRetry}
                        aria-label="Újrapróbálkozás"
                    >
                        Újra
                    </Button>
                ) : null
            }
        >
            {title ? <AlertTitle>{title}</AlertTitle> : null}

            <Box>
                {/* message */}
                {typeof safeMessage === "string" ? (
                    <Typography variant="body2">{safeMessage}</Typography>
                ) : (
                    safeMessage
                )}

                {/* details toggle */}
                {hasDetails ? (
                    <Box sx={{ mt: 1 }}>
                        <Button
                            size="small"
                            color="inherit"
                            onClick={() => setShowDetails((v) => !v)}
                            aria-expanded={showDetails ? "true" : "false"}
                            aria-controls="error-alert-details"
                        >
                            {showDetails ? "Részletek elrejtése" : "Részletek"}
                        </Button>

                        <Collapse in={showDetails}>
                            <Box
                                id="error-alert-details"
                                sx={{
                                    mt: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    bgcolor: "action.hover",
                                    overflow: "auto",
                                    maxHeight: 240,
                                }}
                            >
                                {typeof details === "string" ? (
                                    <Typography
                                        variant="caption"
                                        component="pre"
                                        sx={{ m: 0, whiteSpace: "pre-wrap" }}
                                    >
                                        {details}
                                    </Typography>
                                ) : (
                                    details
                                )}
                            </Box>
                        </Collapse>
                    </Box>
                ) : null}
            </Box>
        </Alert>
    );
}