
import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, AlertTriangle, CheckCircle, Target, TrendingUp, Info } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatting";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function BreakEvenCard({ metrics, currency, inputs }) {
    const [viewMode, setViewMode] = useState('orders'); // orders, leads, confirmed
    const [showDetails, setShowDetails] = useState(false);
    const [dailyOrders, setDailyOrders] = useState(10); // Default assumption

    // Breakdown Data from new calculation logic
    const {
        breakEvenOrders,
        breakEvenLeads,
        breakEvenConfirmed,
        totalFixedCosts,
        contributionMargin,
        avgRevenuePerOrder,
        avgVariableCostPerOrder,
        safetyMargin
    } = metrics.breakEvenAnalysis || {};

    const isProfitable = metrics.profit > 0;

    // We also need "actual" current values to compare against BE
    const actualDelivered = metrics.deliveredOrders;
    const actualConfirmed = metrics.confirmedOrders;
    const actualLeads = metrics.leads;

    // Determine current target & actual based on viewMode
    let target = breakEvenOrders;
    let actual = actualDelivered;
    let unitLabel = "Orders";

    if (viewMode === 'leads') {
        target = breakEvenLeads;
        actual = actualLeads;
        unitLabel = "Leads";
    } else if (viewMode === 'confirmed') {
        target = breakEvenConfirmed;
        actual = actualConfirmed;
        unitLabel = "Confirmations";
    }

    // Progress Calculation
    const progressPercent = target > 0 ? (actual / target) * 100 : 0;
    const displayProgress = Math.min(100, progressPercent);

    // Determine Status
    let statusColor = "text-rose-600";
    let progressColor = "#e11d48"; // rose-600
    let statusMessage = `You need ${formatNumber(target - actual)} more ${unitLabel.toLowerCase()} to break even.`;
    let statusIcon = <AlertTriangle size={20} />;
    let statusBg = "bg-rose-50 border-rose-100";

    if (progressPercent >= 100) {
        statusColor = "text-emerald-600";
        progressColor = "#059669"; // emerald-600
        const excess = actual - target;
        statusMessage = `Profitable zone reached! You are ${formatNumber(excess)} ${unitLabel.toLowerCase()} above break-even.`;
        statusIcon = <CheckCircle size={20} />;
        statusBg = "bg-emerald-50 border-emerald-100";
    } else if (progressPercent >= 80) {
        statusColor = "text-amber-600";
        progressColor = "#d97706"; // amber-600
        statusMessage = `Almost there! Only ${formatNumber(target - actual)} more needed. Keep pushing.`;
        statusBg = "bg-amber-50 border-amber-100";
    }

    // Timeline Calculation
    const remainingOrders = Math.max(0, breakEvenOrders - actualDelivered);
    const daysToBreakEven = dailyOrders > 0 ? Math.ceil(remainingOrders / dailyOrders) : 999;

    const chartData = [
        { name: 'Progress', value: displayProgress },
        { name: 'Remaining', value: 100 - displayProgress }
    ];

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 text-gray-600 rounded-xl border border-gray-100">
                        <Target size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Break-Even Analysis</h3>
                        <p className="text-xs text-gray-500 font-medium">Profitability Threshold Calculator</p>
                    </div>
                </div>
                {isProfitable ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-emerald-200">
                        <CheckCircle size={12} /> Profitable
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full flex items-center gap-1.5 border border-rose-200">
                        <Info size={12} /> Not Profitable
                    </span>
                )}
            </div>

            <div className="p-6 lg:p-8 grid lg:grid-cols-2 gap-12 items-center">

                {/* LEFT: Visual Gauge */}
                <div className="flex flex-col items-center justify-center relative">
                    <div className="relative w-64 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell key="progress" fill={progressColor} />
                                    <Cell key="remaining" fill="#f3f4f6" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Target</span>
                            <span className={`text-5xl font-black ${statusColor} tracking-tighter`}>{formatNumber(target)}</span>
                            <span className="text-sm font-bold text-gray-500 mt-2">{unitLabel}</span>
                        </div>
                    </div>

                    {/* View Toggles */}
                    <div className="flex bg-gray-100 p-1.5 rounded-xl mt-8 gap-1">
                        {['orders', 'leads', 'confirmed'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${viewMode === mode
                                    ? 'bg-white text-gray-900 shadow-sm scale-105'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Content & Insights */}
                <div className="space-y-6">

                    {/* Status Message */}
                    <div className={`p-5 rounded-2xl border ${statusBg}`}>
                        <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 bg-white rounded-full shadow-sm ${statusColor}`}>{statusIcon}</div>
                            <div>
                                <h4 className={`font-bold text-base ${statusColor}`}>Status Update</h4>
                                <p className="text-sm text-gray-700 font-medium mt-1 leading-relaxed">{statusMessage}</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Projection */}
                    {!isProfitable && remainingOrders > 0 && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                            <div className="flex items-center gap-2 mb-4 relative z-10">
                                <Calendar size={18} className="text-indigo-600" />
                                <span className="text-sm font-bold text-gray-900">Time to Break-Even?</span>
                            </div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 block">Daily Rate</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={dailyOrders}
                                            onChange={(e) => setDailyOrders(Math.max(1, Number(e.target.value)))}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">orders/day</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Estimated In</p>
                                    <p className="text-2xl font-black text-indigo-600 tracking-tight">
                                        {daysToBreakEven > 365 ? '> 1 Year' : `${daysToBreakEven} Days`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Safety Margin */}
                    {isProfitable && (
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-bold text-gray-900">Safety Margin</span>
                                <span className={`text-lg font-black ${safetyMargin > 20 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {formatNumber(safetyMargin, 1)}%
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${safetyMargin > 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${Math.min(100, Math.max(0, safetyMargin))}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-400 font-medium">
                                Keep &gt; 20% to stay safe from ad cost spikes.
                            </p>
                        </div>
                    )}

                    {/* Toggle Breakdown */}
                    <div className="pt-2">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all"
                        >
                            {showDetails ? "Hide Calculations" : "View Calculation Formula"}
                            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showDetails && (
                            <div className="mt-3 bg-gray-900 rounded-xl p-5 text-gray-300 text-xs space-y-3 animate-in fade-in slide-in-from-top-1">
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-400">Fixed Ad Costs</span>
                                    <span className="font-bold text-white">{formatCurrency(totalFixedCosts, currency)}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-400">Revenue per Order</span>
                                    <span className="font-bold text-emerald-400">{formatCurrency(avgRevenuePerOrder, currency)}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-400">Variable Costs</span>
                                    <span className="font-bold text-rose-400">-{formatCurrency(avgVariableCostPerOrder, currency)}</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                    <span className="font-bold text-white">Contribution Margin</span>
                                    <span className="font-bold text-indigo-400">{formatCurrency(contributionMargin, currency)}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-800 text-[10px] text-gray-500 font-mono text-center">
                                    Formula: Fixed / Margin = Break-Even
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
