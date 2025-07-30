import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class', // Enables class-based dark mode (important for next-theme and shadcn)
    content: [
        './app/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}

export default config
