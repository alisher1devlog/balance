import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode } from '@/stores/themeStore';

const lightPalette = {
    mode: 'light' as const,
    primary: {
        main: '#1976d2',
        light: '#42a5f5',
        dark: '#1565c0',
    },
    secondary: {
        main: '#dc004e',
        light: '#ff5983',
        dark: '#9a0036',
    },
    background: {
        default: '#f5f5f5',
        paper: '#ffffff',
    },
    text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.6)',
    },
    error: {
        main: '#f44336',
    },
    warning: {
        main: '#ff9800',
    },
    success: {
        main: '#4caf50',
    },
    info: {
        main: '#2196f3',
    },
};

const darkPalette = {
    mode: 'dark' as const,
    primary: {
        main: '#90caf9',
        light: '#e3f2fd',
        dark: '#1565c0',
    },
    secondary: {
        main: '#f48fb1',
        light: '#f6a4c3',
        dark: '#c2185b',
    },
    background: {
        default: '#121212',
        paper: '#1e1e1e',
    },
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
        main: '#f44336',
    },
    warning: {
        main: '#ff9800',
    },
    success: {
        main: '#4caf50',
    },
    info: {
        main: '#2196f3',
    },
};

const commonOptions: ThemeOptions = {
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 700 },
        h2: { fontSize: '2rem', fontWeight: 700 },
        h3: { fontSize: '1.75rem', fontWeight: 700 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        body1: { fontSize: '1rem' },
        body2: { fontSize: '0.875rem' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                    },
                },
            },
        },
    },
};

export const createAppTheme = (mode: ThemeMode) => {
    return createTheme({
        palette: mode === 'light' ? lightPalette : darkPalette,
        ...commonOptions,
    });
};
