// Theme colors from Figma design
export const theme = {
    colors: {
        // Primary backgrounds
        bgDark: '#0C1322',
        bgDarker: '#080D19',
        bgCard: '#111827',
        bgCardHover: '#1F2937',

        // Brand blue — used for buttons, active links, accents
        brand: 'rgba(34, 197, 94, 1)',       
        brandHover: 'rgba(22, 163, 74, 1)',   
        brandMuted: 'rgba(34, 197, 94, 0.35)',
        brandLight: 'rgba(34, 197, 94, 0.1)',

        // Accent colors
        primary: '#10B981',      // Teal/Green
        primaryHover: '#059669',
        primaryLight: 'rgba(16, 185, 129, 0.1)',

        // Text colors
        textWhite: '#FFFFFF',
        textLight: '#F3F4F6',
        textMuted: '#9CA3AF',
        textDark: '#6B7280',

        // Borders
        border: '#1F2937',
        borderLight: '#374151',

        // Status colors
        rating: '#FBBF24',
    },

    spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        '4xl': '6rem',
    },

    radius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
    },

    fonts: {
        body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },

    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px rgba(16, 185, 129, 0.3)',
        brandGlow: '0 4px 12px rgba(17, 82, 212, 0.3)',
    },

    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
    },
};

export default theme;
