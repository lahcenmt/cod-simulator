"use client";

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function I18nProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Ensure i18n is initialized
        if (i18n.isInitialized) {
            setIsInitialized(true);
        } else {
            i18n.on('initialized', () => {
                setIsInitialized(true);
            });
        }

        // Set initial dir
        const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, []);

    if (!isInitialized) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>;
    }

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
