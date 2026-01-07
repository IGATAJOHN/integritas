import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create the context
const ThemeContext = createContext();

// Custom hook to use theme mode
export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeModeProvider');
    }
    return context;
};

// Theme configurations
const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'dark'
            ? {
                // Dark mode colors
                primary: {
                    main: 'rgba(17, 82, 212, 1)',
                    light: 'rgba(17, 82, 212, 0.15)',
                    dark: 'rgba(13, 65, 170, 1)',
                },
                background: {
                    default: '#0C1322',
                    paper: '#111827',
                    darker: '#080D19',
                    hero: 'rgba(40, 46, 57, 1)',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#9CA3AF',
                    muted: '#6B7280',
                },
                divider: '#1F2937',
            }
            : {
                // Light mode colors
                primary: {
                    main: 'rgba(17, 82, 212, 1)',
                    light: 'rgba(17, 82, 212, 0.1)',
                    dark: 'rgba(13, 65, 170, 1)',
                },
                background: {
                    default: '#FFFFFF',
                    paper: '#F8FAFC',
                    darker: '#F1F5F9',
                    hero: '#F8FAFC',
                },
                text: {
                    primary: '#1E293B',
                    secondary: '#64748B',
                    muted: '#94A3B8',
                },
                divider: '#E2E8F0',
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
    },
});

// Theme Provider Component
export const ThemeModeProvider = ({ children }) => {
    // Always default to 'dark' mode - user preference is stored but dark is the default
    const [mode, setMode] = useState('dark');


    // Save mode to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    // Toggle function
    const toggleThemeMode = () => {
        setMode((prevMode) => (prevMode === 'dark' ? 'light' : 'dark'));
    };

    // Create theme based on mode
    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    // Context value
    const contextValue = useMemo(
        () => ({
            mode,
            toggleThemeMode,
            isDark: mode === 'dark',
        }),
        [mode]
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeModeProvider;
