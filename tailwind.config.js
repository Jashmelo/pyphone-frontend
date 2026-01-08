/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'os-bg': '#000000',
                'os-dock': 'rgba(255, 255, 255, 0.1)',
                'os-window': 'rgba(30, 30, 30, 0.8)',
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
