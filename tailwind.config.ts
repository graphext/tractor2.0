import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Mona Sans", "sans-serif"],
                mono: ["Monaspace Neon", "monospaced"],
            },
        },
    },

    plugins: [require("@tailwindcss/typography"), require("daisyui")],

    daisyui: {
        logs: false,
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    "base-100": "#F7F7F7",
                    secondary: "teal",
                    primary: "#2BA3E8",
                    "primary-content": "#FAF7FF",
                    "secondary-content": "#F4FFFF",
                    warning: "#FEC601",
                    "warning-content": "#2E2400",
                    "error-content": "#FFF5F5",
                    success: "#50E3C2",
                    "success-content": "#1B4D42",
                },
            },
            {
                dark: {
                    ...require("daisyui/src/theming/themes")["dark"],
                    primary: "#2BA3E8",
                    "primary-content": "#FFF",
                    secondary: "#00867A",
                    "secondary-content": "#D8F4ED",
                    "base-100": "#1F2024",
                    "base-200": "#27272C",
                    "base-300": "#303037",
                    "base-content": "#FFF",
                    warning: "#FEC601",
                    "warning-content": "#2E2400",
                    error: "#AC2E34",
                    "error-content": "#FFF5F5",
                    success: "#50E3C2",
                    "success-content": "#1B4D42",
                },
            },
            "cupcake",
        ],
    },
} as Config;
