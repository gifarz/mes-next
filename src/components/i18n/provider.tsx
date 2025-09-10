'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from '../../../locales/en';
import { id } from '../../../locales/id';
import { ja } from '../../../locales/ja';

const translations: Record<string, Record<string, string>> = { en, id, ja };

type I18nContextType = {
    locale: string;
    t: (key: string) => string;
    setLocale: (locale: string) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState('en');

    // Load from localStorage on first render
    useEffect(() => {
        const storedLocale = localStorage.getItem('locale');
        if (storedLocale && translations[storedLocale]) {
            setLocaleState(storedLocale);
        }
    }, []);

    // Save to localStorage when locale changes
    const setLocale = (newLocale: string) => {
        if (translations[newLocale]) {
            setLocaleState(newLocale);
            localStorage.setItem('locale', newLocale);
        }
    };

    function t(key: string) {
        return translations[locale]?.[key] || key;
    }

    return (
        <I18nContext.Provider value={{ locale, t, setLocale }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
    return ctx;
}
