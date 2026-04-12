import { createTheme } from "@mui/material/styles";

const MOTION_PRESETS = {
    subtle: {
        cardLift: "translateY(-2px)",
        cardDuration: "180ms",
        cardShadow: "0 12px 22px rgba(0, 0, 0, 0.34)",
        buttonLift: "translateY(-1px)",
        buttonDuration: "150ms",
        buttonShadow: "0 8px 14px rgba(0, 0, 0, 0.32)",
        sheenDuration: "620ms",
    },
    balanced: {
        cardLift: "translateY(-4px)",
        cardDuration: "240ms",
        cardShadow: "0 16px 30px rgba(0, 0, 0, 0.4)",
        buttonLift: "translateY(-2px)",
        buttonDuration: "180ms",
        buttonShadow: "0 10px 18px rgba(0, 0, 0, 0.38)",
        sheenDuration: "780ms",
    },
    lively: {
        cardLift: "translateY(-6px)",
        cardDuration: "260ms",
        cardShadow: "0 20px 34px rgba(0, 0, 0, 0.46)",
        buttonLift: "translateY(-3px)",
        buttonDuration: "200ms",
        buttonShadow: "0 12px 22px rgba(0, 0, 0, 0.44)",
        sheenDuration: "900ms",
    },
};

const motion = MOTION_PRESETS.balanced;

export const theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#4ea8ff", dark: "#2f7bd1", light: "#7fc3ff", contrastText: "#071222" },
        secondary: { main: "#9f8fff", dark: "#7a6dde", light: "#b9adff", contrastText: "#0a0a17" },
        info: { main: "#57c7ff", dark: "#2f8fbe", light: "#8fdcff", contrastText: "#061523" },
        success: { main: "#47d7a1", dark: "#2ea97c", light: "#78e7bc", contrastText: "#051912" },
        warning: { main: "#ffc46b", dark: "#cc9648", light: "#ffd79a", contrastText: "#221404" },
        error: { main: "#ff7f8f", dark: "#d45d6d", light: "#ffadb7", contrastText: "#28060c" },
        background: {
            default: "#0b1220",
            paper: "#111b2f",
        },
        text: {
            primary: "#e9efff",
            secondary: "#a7b6d7",
        },
        divider: "rgba(125, 151, 201, 0.26)",
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
                    backgroundColor: "#0b1220",
                    backgroundImage: [
                        "radial-gradient(circle at 18% 10%, rgba(64, 116, 198, 0.24), transparent 30%)",
                        "radial-gradient(circle at 84% 2%, rgba(96, 80, 186, 0.2), transparent 28%)",
                        "linear-gradient(180deg, #0f1a2f 0%, #0b1220 46%, #080d18 100%)",
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
                    backgroundImage: "linear-gradient(90deg, #0f1f38 0%, #1a2f52 55%, #253b66 100%)",
                    color: "#f0f5ff",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: "#101a2d",
                    color: "#e9efff",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: "#111b2f",
                    border: "1px solid rgba(125, 151, 201, 0.24)",
                    transition: `box-shadow ${motion.cardDuration} ease, transform ${motion.cardDuration} ease, border-color ${motion.cardDuration} ease`,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: "#111b2f",
                    border: "1px solid rgba(125, 151, 201, 0.24)",
                    boxShadow: "0 8px 20px rgba(0, 0, 0, 0.32)",
                    transition: `transform ${motion.cardDuration} ease, box-shadow ${motion.cardDuration} ease, border-color ${motion.cardDuration} ease`,
                    "&:hover": {
                        transform: motion.cardLift,
                        borderColor: "rgba(124, 173, 255, 0.45)",
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
                        background: "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
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
                    backgroundImage: "linear-gradient(180deg, #63b7ff 0%, #4ea8ff 100%)",
                },
                outlinedPrimary: {
                    borderColor: "rgba(78, 168, 255, 0.6)",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    fontWeight: 700,
                    letterSpacing: 0.1,
                },
                outlined: {
                    borderColor: "rgba(125, 151, 201, 0.42)",
                    color: "#c7d6f2",
                    backgroundColor: "rgba(17, 27, 47, 0.42)",
                },
                filledPrimary: {
                    color: "#071222",
                    backgroundColor: "#63b7ff",
                },
                filledSecondary: {
                    color: "#0a0a17",
                    backgroundColor: "#b9adff",
                },
                filledSuccess: {
                    color: "#051912",
                    backgroundColor: "#78e7bc",
                },
                filledWarning: {
                    color: "#221404",
                    backgroundColor: "#ffd79a",
                },
                filledError: {
                    color: "#28060c",
                    backgroundColor: "#ffadb7",
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: "#a7b6d7",
                },
                colorPrimary: {
                    color: "#7fc3ff",
                },
                colorSecondary: {
                    color: "#b9adff",
                },
                colorSuccess: {
                    color: "#78e7bc",
                },
                colorWarning: {
                    color: "#ffd79a",
                },
                colorError: {
                    color: "#ffadb7",
                },
                colorInfo: {
                    color: "#8fdcff",
                },
            },
        },
        MuiContainer: { defaultProps: { maxWidth: "lg" } },
    },
});