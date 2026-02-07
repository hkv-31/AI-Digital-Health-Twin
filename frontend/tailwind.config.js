/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#0ea5e9", // Sky 500 - Medical Blue
                secondary: "#14b8a6", // Teal 500
                background: "#f8fafc", // Slate 50
                surface: "#ffffff",
                text: "#1e293b", // Slate 800
                muted: "#64748b", // Slate 500
                border: "#e2e8f0", // Slate 200
                error: "#ef4444",
                success: "#22c55e",
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
