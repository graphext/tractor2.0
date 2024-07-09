import type { Config } from 'tailwindcss'

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],

    theme: {
        extend: {}
    },

    plugins: [require('@tailwindcss/typography'), require('daisyui')],

    daisyui: {
        logs: false,
        themes: ['light', 'dark', 'cupcake']
    }
} as Config
