import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#1976d2" },
        secondary: { main: "#7c4dff" },
        background: { default: "#f6f7fb" },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: [
            "Inter",
            "system-ui",
            "-apple-system",
            "Segoe UI",
            "Roboto",
            "Helvetica",
            "Arial",
            "sans-serif",
        ].join(","),
        h4: { fontWeight: 800 },
        h5: { fontWeight: 800 },
        button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
        MuiPaper: { styleOverrides: { root: { borderRadius: 12 } } },
        MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
        MuiContainer: { defaultProps: { maxWidth: "lg" } },
    },
});