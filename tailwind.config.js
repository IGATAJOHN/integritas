/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    100: '#282E39',
                    200: '#1C1F27',
                    300: '#111318',
                    400: '#0D0F12',
                },
                primary: {
                    50: '#EBF5FF',
                    100: '#E1EFFE',
                    200: '#C3DDFD',
                    300: '#A4CAFE',
                    400: '#76A9FA',
                    500: '#3B82F6',
                    600: '#1152D4',
                    700: '#1E40AF',
                    800: '#1E3A8A',
                    900: '#1E3A5F',
                },
                secondary: {
                    500: '#059669',
                    600: '#047857',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
