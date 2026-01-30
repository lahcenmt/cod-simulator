"use client";

import React from 'react';
import Link from 'next/link';
import {
    Calculator,
    TrendingUp,
    BarChart3,
    CheckCircle,
    Zap,
    Shield,
    ArrowRight,
    LayoutDashboard
} from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="bg-slate-50 font-sans text-slate-900">

            {/* 1. HERO SECTION */}
            <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
                <div className="absolute top-0 left-0 w-full h-full bg-white/50 -z-10"></div>
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <Zap size={12} className="fill-indigo-700" /> V.1.0 Now Live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
                        Master Your COD <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">E-commerce Profits</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
                        Stop guessing. Start scaling. The ultimate simulator for Cash on Delivery businesses to plan budgets, analyze funnels, and predict ROI with precision.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto">
                            Start Free Trial
                        </Link>
                        <Link href="/login" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-lg font-bold rounded-xl transition-all hover:border-indigo-300 w-full sm:w-auto flex items-center justify-center gap-2">
                            <LayoutDashboard size={20} /> Try Demo
                        </Link>
                    </div>

                    <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/10 pointer-events-none"></div>
                        {/* Abstract UI Representation */}
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
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything You Need to Scale</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">From ad spend specific to GCC/Africa markets to detailed funnel leakage analysis.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Calculator className="w-8 h-8 text-white" />,
                                color: "bg-blue-500",
                                title: "Advanced Calculator",
                                desc: "Input your COGS, shipping, and ad spend to see real-time Net Profit and ROI projections."
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-white" />,
                                color: "bg-emerald-500",
                                title: "Funnel Analytics",
                                desc: "Visualize where you lose money. Track Lead → Confirm → Deliver drop-off points effortlessly."
                            },
                            {
                                icon: <TrendingUp className="w-8 h-8 text-white" />,
                                color: "bg-violet-500",
                                title: "Budget Planner",
                                desc: "AI-driven suggestions on how to allocate your daily budget for testing vs scaling phases."
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
                {/* Background decor */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Simple, Transparent Pricing</h2>
                        <p className="text-indigo-200 text-lg max-w-2xl mx-auto">Choose the plan that fits your growth stage. Upgrade anytime.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                        {/* FREE PLAN */}
                        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 relative hover:border-slate-600 transition-all">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">Free</span>
                                </div>
                                <p className="text-slate-400 mt-2 text-sm">Forever free for beginners.</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle size={18} className="text-emerald-400" /> 10 Simulations / month
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle size={18} className="text-emerald-400" /> Basic Profit Calculator
                                </li>
                                <li className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle size={18} className="text-emerald-400" /> Local Storage Only
                                </li>
                                <li className="flex items-center gap-3 text-slate-500">
                                    <Shield size={18} /> No Cloud Sync
                                </li>
                            </ul>

                            <Link href="/signup" className="block w-full py-4 text-center bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all">
                                Get Started
                            </Link>
                        </div>

                        {/* PRO PLAN */}
                        <div className="bg-gradient-to-b from-indigo-900 to-slate-900 rounded-3xl p-8 border border-indigo-500 relative shadow-2xl transform md:-translate-y-4">
                            <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold uppercase py-1 px-3 rounded-bl-xl rounded-tr-2xl tracking-widest">
                                Most Popular
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Pro Scale</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">$1</span>
                                    <span className="text-indigo-300 font-bold">/month</span>
                                </div>
                                <p className="text-indigo-200 mt-2 text-sm">Unleash full power.</p>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 bg-indigo-500 rounded-full"><CheckCircle size={14} className="text-white" /></div>
                                    Unlimited Simulations
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 bg-indigo-500 rounded-full"><CheckCircle size={14} className="text-white" /></div>
                                    Cloud Save & Sync
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 bg-indigo-500 rounded-full"><CheckCircle size={14} className="text-white" /></div>
                                    Advanced Funnel Analysis
                                </li>
                                <li className="flex items-center gap-3 text-white font-medium">
                                    <div className="p-1 bg-indigo-500 rounded-full"><CheckCircle size={14} className="text-white" /></div>
                                    Priority Support
                                </li>
                            </ul>

                            <Link href="/signup?plan=pro" className="block w-full py-4 text-center bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all hover:shadow-indigo-500/25">
                                Upgrade Now
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
                    <p className="text-sm">© 2026 Profit Simulator. Built for dropshippers, by dropshippers.</p>
                </div>
            </footer>
        </div>
    );
}
