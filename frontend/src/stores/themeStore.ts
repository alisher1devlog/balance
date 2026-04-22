import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
    mode: ThemeMode;
    toggle: () => void;
    setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
    // Load from localStorage
    const savedTheme = (localStorage.getItem('theme') || 'light') as ThemeMode;

    return {
        mode: savedTheme,

        setMode: (mode) => {
            set({ mode });
            localStorage.setItem('theme', mode);
        },

        toggle: () => {
            set((state) => {
                const newMode: ThemeMode = state.mode === 'light' ? 'dark' : 'light';
                localStorage.setItem('theme', newMode);
                return { mode: newMode };
            });
        },
    };
});
