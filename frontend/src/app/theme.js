import { createTheme } from "@mui/material/styles";

const MOTION_PRESETS = {
    subtle: {
        cardLift: "translateY(-2px)",
        cardDuration: "180ms",
        cardShadow: "0 12px 22px rgba(47, 36, 24, 0.11)",
        buttonLift: "translateY(-1px)",
        buttonDuration: "150ms",
        buttonShadow: "0 8px 14px rgba(47, 36, 24, 0.13)",
        sheenDuration: "620ms",
    },
    balanced: {
        cardLift: "translateY(-4px)",
        cardDuration: "240ms",
        cardShadow: "0 16px 30px rgba(47, 36, 24, 0.14)",
        buttonLift: "translateY(-2px)",
        buttonDuration: "180ms",
        buttonShadow: "0 10px 18px rgba(47, 36, 24, 0.16)",
        sheenDuration: "780ms",
    },
    lively: {
        cardLift: "translateY(-6px)",
        cardDuration: "260ms",
        cardShadow: "0 20px 34px rgba(47, 36, 24, 0.18)",
        buttonLift: "translateY(-3px)",
        buttonDuration: "200ms",
        buttonShadow: "0 12px 22px rgba(47, 36, 24, 0.2)",
        sheenDuration: "900ms",
    },
};

const motion = MOTION_PRESETS.balanced;

export const theme = createTheme({
    palette: {
        mode: "light",
        primary: { main: "#2f6a5f", dark: "#25554d", light: "#4e8a7f", contrastText: "#fffdf8" },
        secondary: { main: "#b07a3f", dark: "#8f5f2f", light: "#c59560", contrastText: "#fff9f2" },
        background: {
            default: "#f5ecde",
            paper: "#fff9ef",
        },
        text: {
            primary: "#2f2418",
            secondary: "#695744",
        },
        divider: "rgba(143, 95, 47, 0.2)",
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: [
            "Source Sans 3",
            "Segoe UI",
            "Trebuchet MS",
            "Arial",
            "sans-serif",
        ].join(","),
        h1: { fontFamily: ["Cormorant Garamond", "Palatino Linotype", "Book Antiqua", "serif"].join(","), fontWeight: 700, letterSpacing: 0.2 },
        h2: { fontFamily: ["Cormorant Garamond", "Palatino Linotype", "Book Antiqua", "serif"].join(","), fontWeight: 700, letterSpacing: 0.1 },
        h3: { fontFamily: ["Cormorant Garamond", "Palatino Linotype", "Book Antiqua", "serif"].join(","), fontWeight: 700, letterSpacing: 0.1 },
        h4: { fontFamily: ["Cormorant Garamond", "Palatino Linotype", "Book Antiqua", "serif"].join(","), fontWeight: 700, letterSpacing: 0.08 },
        h5: { fontFamily: ["Cormorant Garamond", "Palatino Linotype", "Book Antiqua", "serif"].join(","), fontWeight: 700, letterSpacing: 0.06 },
        button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                "@keyframes buttonSheen": {
                    "0%": { transform: "translateX(-130%) skewX(-20deg)" },
                    "100%": { transform: "translateX(230%) skewX(-20deg)" },
                },
                body: {
                    backgroundColor: "#f5ecde",
                    backgroundImage: [
                        "radial-gradient(circle at 20% 10%, rgba(176,122,63,0.16), transparent 28%)",
                        "radial-gradient(circle at 80% 0%, rgba(47,106,95,0.12), transparent 25%)",
                        "linear-gradient(180deg, #f8f0e3 0%, #f5ecde 42%, #efe3d1 100%)",
                    ].join(","),
                    backgroundAttachment: "fixed",
                },
                "#root": {
                    minHeight: "100svh",
                },
                "@media (prefers-reduced-motion: reduce)": {
                    "*": {
                        animationDuration: "0.01ms !important",
                        animationIterationCount: "1 !important",
                        transitionDuration: "0.01ms !important",
                        scrollBehavior: "auto !important",
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundImage: "linear-gradient(90deg, #2b5c53 0%, #356f65 100%)",
                    color: "#fff7ea",
                    boxShadow: "0 6px 20px rgba(47, 36, 24, 0.18)",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#fff7ea",
                    color: "#2f2418",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: "#fff9ef",
                    border: "1px solid rgba(143, 95, 47, 0.18)",
                    transition: `box-shadow ${motion.cardDuration} ease, transform ${motion.cardDuration} ease, border-color ${motion.cardDuration} ease`,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: "#fff9ef",
                    border: "1px solid rgba(143, 95, 47, 0.18)",
                    boxShadow: "0 8px 20px rgba(47, 36, 24, 0.06)",
                    transition: `transform ${motion.cardDuration} ease, box-shadow ${motion.cardDuration} ease, border-color ${motion.cardDuration} ease`,
                    "&:hover": {
                        transform: motion.cardLift,
                        borderColor: "rgba(143, 95, 47, 0.38)",
                        boxShadow: motion.cardShadow,
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    position: "relative",
                    overflow: "hidden",
                    transition: `transform ${motion.buttonDuration} ease, box-shadow ${motion.buttonDuration} ease, filter ${motion.buttonDuration} ease`,
                    "&::after": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "32%",
                        height: "100%",
                        background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%)",
                        transform: "translateX(-140%) skewX(-20deg)",
                        opacity: 0,
                    },
                    "&:hover": {
                        transform: motion.buttonLift,
                        boxShadow: motion.buttonShadow,
                    },
                    "&:hover::after": {
                        opacity: 1,
                        animation: `buttonSheen ${motion.sheenDuration} ease`,
                    },
                    "&:active": {
                        transform: "translateY(0)",
                        filter: "brightness(0.98)",
                    },
                },
                containedPrimary: {
                    backgroundImage: "linear-gradient(180deg, #3b7d70 0%, #2f6a5f 100%)",
                },
                outlinedPrimary: {
                    borderColor: "rgba(47, 106, 95, 0.5)",
                },
            },
        },
        MuiContainer: { defaultProps: { maxWidth: "lg" } },
    },
});