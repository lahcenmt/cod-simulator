
"use client";

import { useState, useMemo, useEffect } from "react";
import {
    Calculator, TrendingUp, ShieldCheck, ShieldAlert, Shield,
    PieChart as PieIcon, BarChart3, ArrowLeft, Save, Download, Mail, Zap,
    Clock, Package, Truck, Percent, AlertCircle, CheckCircle, Info, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { calculateCODBudget, calculateScenarios, calculateBreakEven } from "@/lib/moroccoBudgetCalc";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area, BarChart, Bar
} from "recharts";

export default function BudgetPlannerView() {
    // --- STATE MANAGEMENT ---

    // 1. Budget & Duration
    const [totalBudget, setTotalBudget] = useState(5000);
    const [durationIndays, setDurationInDays] = useState(30);

    // 2. Product Info
    const [productPrice, setProductPrice] = useState(249);
    const [productCost, setProductCost] = useState(80);
    const [shippingCost, setShippingCost] = useState(30);

    // 3. Performance Rates (Sliders)
    const [confirmationRate, setConfirmationRate] = useState(50); // %
    const [deliveryRate, setDeliveryRate] = useState(45); // %

    // 4. Channel Split
    const [fbPercent, setFbPercent] = useState(60);

    // 5. CPL Strategies (Editable)
    const [strategies, setStrategies] = useState({
        conservative: { cpl: 20, label: 'Conservative' },
        balanced: { cpl: 30, label: 'Balanced' },
        aggressive: { cpl: 45, label: 'Aggressive' }
    });
    const [selectedStrategy, setSelectedStrategy] = useState('balanced');

    // 6. Weekly Distribution (Editable)
    // We store as raw number amounts
    const [weeklyBudgets, setWeeklyBudgets] = useState({
        week1: 0,
        week2: 0,
        week3: 0,
        week4: 0
    });

    // --- EFFECTS ---

    // Initialize weekly budgets when total budget changes (Default curve)
    useEffect(() => {
        // Default curve: Test (17.5%) -> Scale (24.5%) -> Peak (28%) -> Optimize (30%)
        setWeeklyBudgets({
            week1: Math.round(totalBudget * 0.175),
            week2: Math.round(totalBudget * 0.245),
            week3: Math.round(totalBudget * 0.280),
            week4: Math.round(totalBudget * 0.300)
        });
    }, [totalBudget]);

    // --- CALCULATIONS ---

    const currentState = {
        totalBudget,
        duration: durationIndays,
        productPrice,
        productCost,
        shippingCost,
        confirmationRate: confirmationRate / 100,
        deliveryRate: deliveryRate / 100,
        channelSplit: { facebook: fbPercent, tiktok: 100 - fbPercent },
        selectedCPL: strategies[selectedStrategy].cpl
    };

    const results = useMemo(() => calculateCODBudget(currentState), [
        totalBudget, durationIndays, productPrice, productCost, shippingCost,
        confirmationRate, deliveryRate, fbPercent, strategies, selectedStrategy
    ]);

    const scenarios = useMemo(() => calculateScenarios(currentState), [
        totalBudget, durationIndays, productPrice, productCost, shippingCost,
        confirmationRate, deliveryRate, fbPercent, strategies, selectedStrategy
    ]);

    const breakEven = useMemo(() => calculateBreakEven(currentState), [
        totalBudget, productPrice, productCost, shippingCost, confirmationRate, deliveryRate
    ]);

    // Helper calculate for Strategy Cards
    const getStrategyPreview = (stratKey) => {
        const cpl = strategies[stratKey].cpl;
        return calculateCODBudget({ ...currentState, selectedCPL: cpl });
    };

    // --- HANDLERS ---
    const updateStrategyCPL = (key, val) => {
        setStrategies(prev => ({
            ...prev,
            [key]: { ...prev[key], cpl: Number(val) }
        }));
    };

    const formatCurrency = (val) => new Intl.NumberFormat('en-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(val);

    // Chart Data
    const pacingData = [
        { day: 'Week 1', spend: weeklyBudgets.week1, label: 'Test' },
        { day: 'Week 2', spend: weeklyBudgets.week2, label: 'Scale' },
        { day: 'Week 3', spend: weeklyBudgets.week3, label: 'Peak' },
        { day: 'Week 4', spend: weeklyBudgets.week4, label: 'Opt' },
    ];

    // Scenario Chart Data
    const scenarioData = [
        { name: 'Worst Case', profit: scenarios.worst.profit, fill: '#ef4444' },
        { name: 'Expected', profit: scenarios.expected.profit, fill: '#3b82f6' },
        { name: 'Best Case', profit: scenarios.best.profit, fill: '#10b981' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                            <Calculator size={24} />
                        </span>
                        COD Budget Planner
                    </h1>
                    <p className="text-slate-500 mt-1">Morocco-optimized ad spend planner for Facebook & TikTok</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium shadow-sm">
                        <Save size={16} /> Save
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md shadow-indigo-100 transition-all">
                        <Zap size={16} /> Apply Plan
                    </button>
                </div>
            </div>

            {/* SECTION 1: BUDGET CONFIGURATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1.1 Main Budget Input */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">1</span>
                        <h3 className="font-bold text-slate-800">Budget & Duration</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Total Marketing Budget</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={totalBudget}
                                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                                    className="w-full text-2xl font-black text-slate-900 bg-slate-50 p-3 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">MAD</span>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Campaign Duration</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[7, 15, 30].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDurationInDays(d)}
                                        className={`py-2 rounded-lg text-sm font-bold border ${durationIndays === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        {d} Days
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 1.2 Product Settings */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">2</span>
                        <h3 className="font-bold text-slate-800">Product Info</h3>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-xs font-bold text-slate-400 uppercase">Selling Price</label>
                                <span className="text-xs font-bold text-slate-900">{formatCurrency(productPrice)}</span>
                            </div>
                            <input
                                type="number"
                                value={productPrice}
                                onChange={(e) => setProductPrice(Number(e.target.value))}
                                className="w-full bg-slate-50 p-2 rounded-lg text-sm font-bold border cursor-pointer border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Prod. Cost</label>
                                <input
                                    type="number"
                                    value={productCost}
                                    onChange={(e) => setProductCost(Number(e.target.value))}
                                    className="w-full bg-slate-50 p-2 rounded-lg text-sm font-bold border border-slate-200 outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Ship. Cost</label>
                                <input
                                    type="number"
                                    value={shippingCost}
                                    onChange={(e) => setShippingCost(Number(e.target.value))}
                                    className="w-full bg-slate-50 p-2 rounded-lg text-sm font-bold border border-slate-200 outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-lg flex justify-between items-center mt-2">
                            <span className="text-xs font-bold text-emerald-700">Profit / Order</span>
                            <span className="text-sm font-black text-emerald-700">{formatCurrency(productPrice - productCost - shippingCost)}</span>
                        </div>
                    </div>
                </div>

                {/* 1.3 COD Performance */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">3</span>
                        <h3 className="font-bold text-slate-800">COD Rates</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Confirmation Rate */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Confirmation Rate</label>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${confirmationRate >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {confirmationRate}%
                                </span>
                            </div>
                            <input
                                type="range" min="20" max="90" step="5"
                                value={confirmationRate}
                                onChange={(e) => setConfirmationRate(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #4f46e5 ${((confirmationRate - 20) / (90 - 20)) * 100}%, #e2e8f0 ${((confirmationRate - 20) / (90 - 20)) * 100}%)`
                                }}
                            />
                        </div>

                        {/* Delivery Rate */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Delivery Rate</label>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${deliveryRate >= 45 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {deliveryRate}%
                                </span>
                            </div>
                            <input
                                type="range" min="20" max="80" step="5"
                                value={deliveryRate}
                                onChange={(e) => setDeliveryRate(Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, #4f46e5 ${((deliveryRate - 20) / (80 - 20)) * 100}%, #e2e8f0 ${((deliveryRate - 20) / (80 - 20)) * 100}%)`
                                }}
                            />
                        </div>

                        <div className="text-[11px] text-slate-400 bg-slate-50 p-2 rounded-lg leading-tight">
                            ℹ️ 100 Leads → <strong>{Math.round(100 * (confirmationRate / 100))}</strong> Confirm → <strong>{Math.round(100 * (confirmationRate / 100) * (deliveryRate / 100))}</strong> Deliver
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2 & 3: ALLOCATION & STRATEGY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column (Allocations) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* 2. Channel Split */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">4</span>
                                Marketing Channel Split
                            </h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {[100, 50, 0].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setFbPercent(val)}
                                        className="px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-indigo-600 uppercase"
                                    >
                                        {val === 100 ? 'FB Only' : val === 0 ? 'TikTok Only' : '50/50'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Facebook Slider */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2 text-blue-600 font-bold">
                                        <div className="w-3 h-3 rounded-full bg-blue-600" /> Facebook Ads
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-900">{fbPercent}%</div>
                                        <div className="text-xs text-slate-400 font-bold">{formatCurrency(totalBudget * (fbPercent / 100))}</div>
                                    </div>
                                </div>
                                <input
                                    type="range" min="0" max="100" step="10"
                                    value={fbPercent}
                                    onChange={(e) => setFbPercent(Number(e.target.value))}
                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, #2563eb ${fbPercent}%, #e2e8f0 ${fbPercent}%)`
                                    }}
                                />
                            </div>

                            {/* TikTok Visual (Inverted) */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex items-center gap-2 text-black font-bold">
                                        <div className="w-3 h-3 rounded-full bg-black" /> TikTok Ads
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-slate-900">{100 - fbPercent}%</div>
                                        <div className="text-xs text-slate-400 font-bold">{formatCurrency(totalBudget * ((100 - fbPercent) / 100))}</div>
                                    </div>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black transition-all duration-300"
                                        style={{ width: `${100 - fbPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. CPL Strategy Cards */}
                    <div>
                        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">5</span>
                            Choose CPL Strategy
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {['conservative', 'balanced', 'aggressive'].map((key) => {
                                const strat = strategies[key];
                                const preview = getStrategyPreview(key);
                                const isSelected = selectedStrategy === key;
                                const theme = {
                                    conservative: 'emerald',
                                    balanced: 'blue',
                                    aggressive: 'orange'
                                }[key];

                                return (
                                    <div
                                        key={key}
                                        onClick={() => setSelectedStrategy(key)}
                                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg bg-white
                                            ${isSelected
                                                ? `border-${theme}-500 ring-1 ring-${theme}-500 shadow-md`
                                                : 'border-slate-100 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className={`text-xs font-black uppercase mb-3 text-${theme}-600 tracking-wider`}>
                                            {strat.label}
                                        </div>

                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-xs font-bold text-slate-400">CPL:</span>
                                            <div onClick={(e) => e.stopPropagation()} className="relative flex-1">
                                                <input
                                                    type="number"
                                                    value={strat.cpl}
                                                    onChange={(e) => updateStrategyCPL(key, e.target.value)}
                                                    className={`w-full font-black text-xl border-b border-dashed border-slate-300 focus:border-${theme}-500 outline-none bg-transparent py-0`}
                                                />
                                                <span className="absolute right-0 top-1 text-[10px] text-slate-400 font-bold">MAD</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Exp. Leads</span>
                                                <span className="font-bold text-slate-900">{preview.totalLeads}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">To Deliver</span>
                                                <span className="font-bold text-slate-900">{preview.deliveredOrders}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-slate-50 p-1 rounded">
                                                <span className="text-slate-500 font-bold">Profit</span>
                                                <span className={`font-black ${preview.financials.profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {formatCurrency(preview.financials.profit)}
                                                </span>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className={`absolute -top-3 -right-3 w-6 h-6 bg-${theme}-500 rounded-full flex items-center justify-center text-white shadow-sm`}>
                                                <CheckCircle size={14} fill="currentColor" className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Daily Spend Plan */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">6</span>
                                Spending Plan ({Math.round(durationIndays / 7)} Weeks)
                            </h3>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                Total: {formatCurrency(Object.values(weeklyBudgets).reduce((a, b) => a + b, 0))}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                {['week1', 'week2', 'week3', 'week4'].map((weekKey, i) => (
                                    <div key={weekKey} className="flex items-center gap-3">
                                        <div className="w-24 text-xs font-bold text-slate-500 uppercase">Week {i + 1}</div>
                                        <div className="flex-1 relative">
                                            <input
                                                type="number"
                                                value={weeklyBudgets[weekKey]}
                                                onChange={(e) => setWeeklyBudgets({ ...weeklyBudgets, [weekKey]: Number(e.target.value) })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 pl-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                            <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">MAD</span>
                                        </div>
                                        <div className="w-20 text-[10px] text-right text-slate-400 font-bold">
                                            ~{Math.round(weeklyBudgets[weekKey] / 7)} /day
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={pacingData}>
                                        <defs>
                                            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <Tooltip formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                        <Area type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (Results) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* 5. Summary Card */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
                        <h3 className="font-bold text-indigo-200 uppercase text-xs mb-6 tracking-widest flex items-center gap-2">
                            <TrendingUp size={14} /> Expected Results
                        </h3>

                        <div className="grid grid-cols-2 gap-y-6 mb-8">
                            <div>
                                <div className="text-indigo-300 text-[10px] font-bold uppercase mb-1">Expected Leads</div>
                                <div className="text-2xl font-black">{results.totalLeads}</div>
                            </div>
                            <div>
                                <div className="text-indigo-300 text-[10px] font-bold uppercase mb-1">Deliveries</div>
                                <div className="text-2xl font-black">{results.deliveredOrders}</div>
                            </div>
                            <div>
                                <div className="text-indigo-300 text-[10px] font-bold uppercase mb-1">Revenue</div>
                                <div className="text-xl font-bold">{formatCurrency(results.financials.revenue)}</div>
                            </div>
                            <div>
                                <div className="text-indigo-300 text-[10px] font-bold uppercase mb-1">Net Profit</div>
                                <div className={`text-xl font-bold ${results.financials.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {formatCurrency(results.financials.profit)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-indigo-200">ROI</span>
                                <span className="font-bold">{results.financials.roi.toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-indigo-200">Safety Margin</span>
                                <span className="font-bold">{(results.financials.margin).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* 6. Break-Even Analysis */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield size={18} className="text-slate-400" /> Break-Even Analysis
                        </h3>

                        <div className="space-y-4">
                            <div className={`p-3 rounded-xl border-l-4 ${breakEven.isProfitableUnit ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'}`}>
                                <div className="text-xs font-bold text-slate-500 uppercase mb-1">Break-Even Point</div>
                                <div className="text-lg font-black text-slate-900">
                                    {breakEven.minDeliveredOrders} <span className="text-sm font-medium text-slate-500">Delivered Orders</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="text-slate-500 mb-1">Max Safe CPL</div>
                                    <div className="font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded">
                                        {formatCurrency(breakEven.maxCPL)}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-1">Profit/Order</div>
                                    <div className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        {formatCurrency(breakEven.profitPerOrder)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 7. Scenarios Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4 text-sm">What-If Scenarios</h3>
                        <div className="h-40">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={scenarioData} layout="vertical" margin={{ left: 40, right: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(val) => formatCurrency(val)} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                    <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={20}>
                                        {scenarioData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 8. Morocco Tips */}
                    <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-3 text-sm">
                            <Info size={16} /> Morocco COD Tips
                        </h3>
                        <ul className="space-y-2">
                            {[
                                "Start with MAD 100/day for testing",
                                "Target 25-45 age group on Facebook",
                                "Avoid Friday mornings for ads",
                                "Call leads within 1 hour"
                            ].map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-indigo-800">
                                    <CheckCircle size={12} className="mt-0.5 shrink-0 opacity-50" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

// Keep it clean.
