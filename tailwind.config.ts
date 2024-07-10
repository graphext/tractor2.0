import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: { fontFamily: { sans: ["Lato"] } },
    },

    plugins: [require("@tailwindcss/typography"), require("daisyui")],

    daisyui: {
        logs: false,
        themes: [
            {
                light: {
                    ...require("daisyui/src/theming/themes")["light"],
                    secondary: "teal",
                    "primary-content": "#FAF7FF",
                    "secondary-content": "#F4FFFF",
                    warning: "#FEC601",
                    "warning-content": "#2E2400",
                    "error-content": "#FFF5F5",
                },
            },
            "dark",
            "cupcake",
        ],
    },
} as Config;
