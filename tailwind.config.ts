import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class', // Enables class-based dark mode (important for next-theme and shadcn)
    content: [
        './app/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        fontSize: {
            xs: "12px",
            sm: "14px",
            base: "20px", // overrides default base size
            lg: "24px",
            xl: "28px",
            "2xl": "32px",
            "3xl": "36px",
            "4xl": "42px",
            "5xl": "48px",
        },
        extend: {},
    },
    plugins: [],
}

export default config
