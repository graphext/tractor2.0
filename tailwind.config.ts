import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Mona Sans"],
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
                    "base-content": "#FFF",
                    warning: "#FEC601",
                    "warning-content": "#2E2400",
                    error: "#AC2E34",
                    "error-content": "#FFF5F5",
                },
            },
            "cupcake",
        ],
    },
} as Config;
