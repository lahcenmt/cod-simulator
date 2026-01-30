"use client";

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
    Calculator,
    TrendingUp,
    BarChart3,
    CheckCircle,
    Zap,
    Shield,
    LayoutDashboard
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

export default function LandingPage() {
    const { t } = useTranslation('common');

    return (
        <div className="bg-slate-50 font-sans text-slate-900">

            {/* Language Switcher - Fixed Top Right */}
            <div className="fixed top-24 right-4 z-50">
                <LanguageSwitcher />
            </div>

            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="absolute top-0 left-0 w-full h-full bg-white/50 -z-10"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <Zap size={12} className="fill-indigo-700" /> {t('landing.hero.badge')}
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
                        {t('landing.hero.title')} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                            {t('landing.hero.titleHighlight')}
                        </span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
                        {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto">
                            {t('landing.hero.ctaPrimary')}
                        </Link>
                        <Link href="/login" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-bold rounded-xl transition-all hover:border-indigo-300 w-full sm:w-auto flex items-center justify-center gap-2">
                            <LayoutDashboard size={20} /> {t('landing.hero.ctaSecondary')}
                        </Link>
                    </div>

                    <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/10 pointer-events-none"></div>
                        <div className="bg-white p-4 grid grid-cols-12 gap-4 h-[300px] md:h-[500px] opacity-90">
                            <div className="col-span-3 bg-slate-50 rounded-lg h-full border border-slate-100"></div>
                            <div className="col-span-9 space-y-4">
                                <div className="grid grid-cols-4 gap-4 h-32">
                                    <div className="bg-indigo-50 rounded-lg border border-indigo-100"></div>
                                    <div className="bg-emerald-50 rounded-lg border border-emerald-100"></div>
                                    <div className="bg-orange-50 rounded-lg border border-orange-100"></div>
                                    <div className="bg-slate-50 rounded-lg border border-slate-100"></div>
                                </div>
                                <div className="bg-slate-50 rounded-lg h-64 border border-slate-100 flex items-center justify-center">
                                    <span className="text-slate-300 font-bold text-2xl">Interactive Dashboard Preview</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. FEATURES GRID */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('landing.features.title')}</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">{t('landing.features.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Calculator className="w-8 h-8 text-white" />,
                                color: "bg-blue-500",
                                title: t('landing.features.calculator.title'),
                                desc: t('landing.features.calculator.desc')
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-white" />,
                                color: "bg-emerald-500",
                                title: t('landing.features.funnel.title'),
                                desc: t('landing.features.funnel.desc')
                            },
                            {
                                icon: <TrendingUp className="w-8 h-8 text-white" />,
                                color: "bg-violet-500",
                                title: t('landing.features.budget.title'),
                                desc: t('landing.features.budget.desc')
                            }
                        ].map((feature, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-300">
                                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. PRICING SECTION */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">{t('landing.pricing.title')}</h2>
                        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">{t('landing.pricing.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                        {/* FREE PLAN */}
                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 relative hover:border-slate-600 transition-all">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">{t('landing.pricing.free.name')}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">{t('landing.pricing.free.price')}</span>
                                </div>
                                <p className="text-slate-400 mt-2 text-sm">{t('landing.pricing.free.desc')}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {t('landing.pricing.free.features', { returnObjects: true }).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-300">
                                        <CheckCircle size={18} className="text-emerald-400" /> {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/signup" className="block w-full py-4 text-center bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                                {t('landing.pricing.free.cta')}
                            </Link>
                        </div>

                        {/* PRO PLAN */}
                        <div className="bg-gradient-to-b from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500 relative shadow-2xl transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase py-1 px-3 rounded-bl-xl rounded-tr-2xl tracking-widest">
                                {t('landing.pricing.pro.badge')}
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">{t('landing.pricing.pro.name')}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">{t('landing.pricing.pro.price')}</span>
                                    <span className="text-indigo-300 font-bold">{t('landing.pricing.pro.period')}</span>
                                </div>
                                <p className="text-indigo-200 mt-2 text-sm">{t('landing.pricing.pro.desc')}</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {t('landing.pricing.pro.features', { returnObjects: true }).map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white font-medium">
                                        <div className="p-1 bg-indigo-500 rounded-full"><CheckCircle size={14} className="text-white" /></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link href="/signup?plan=pro" className="block w-full py-4 text-center bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all hover:shadow-indigo-500/25">
                                {t('landing.pricing.pro.cta')}
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4. FOOTER */}
            <footer className="bg-slate-900 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <Zap className="text-white fill-white" size={16} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">CodSim.pro</span>
                    </div>
                    <p className="text-sm mb-2">{t('landing.footer.tagline')}</p>
                    <p className="text-sm">{t('landing.footer.copyright')}</p>
                </div>
            </footer>
        </div>
    );
}
