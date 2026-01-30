"use client";

import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    useEffect(() => {
        // Set HTML dir and lang attributes
        const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Switch Language"
        >
            <Globe size={18} className="text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
                {i18n.language === 'en' ? 'العربية' : 'English'}
            </span>
        </button>
    );
}
