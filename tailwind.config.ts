import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{html,js,svelte,ts}"],

    theme: {
        extend: { fontFamily: { sans: ["Graphik"] } },
    },

    plugins: [require("@tailwindcss/typography"), require("daisyui")],

    daisyui: {
        logs: false,
        themes: ["light", "dark", "cupcake"],
    },
} as Config;
