import { create } from 'zustand';

export type Language = 'uz' | 'en' | 'ru';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => {
    // Load from localStorage, default uz
    const savedLanguage = (localStorage.getItem('language') ||
        (import.meta.env.VITE_DEFAULT_LANGUAGE || 'uz')) as Language;

    return {
        language: savedLanguage,

        setLanguage: (lang) => {
            set({ language: lang });
            localStorage.setItem('language', lang);
        },
    };
});
