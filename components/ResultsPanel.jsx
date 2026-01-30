import { Wallet, TrendingUp, TrendingDown, Zap, AlertCircle, CheckCircle, Package, ArrowRight } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatting";
import { motion } from "framer-motion";

export default function ResultsPanel({ metrics, currency, baselineMetrics }) {
    const {
        revenue,
        totalCost,
        profit,
        margin,
        roi,
        confirmedOrders,
        deliveredOrders,
        leads,
        breakdown,
        realCostPerDeliveredOrder,
        adCost
    } = metrics;

    if (!metrics) return null;

    const isProfitable = profit > 0;

    // Helper for Diff
    const RenderDiff = ({ current, baseline, inverse = false, className = "" }) => {
        if (!baseline && baseline !== 0) return null;
        if (baseline === 0) return null;

        const diff = ((current - baseline) / baseline) * 100;
        if (Math.abs(diff) < 0.5) return null;

        const isPositive = diff > 0;
        const isGood = inverse ? !isPositive : isPositive;

        return (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'} ${className}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(diff).toFixed(0)}%
            </span>
        );
    };

    return (
        <div className="space-y-6">

            {/* HERO & METRICS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: NET PROFIT (70%) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                        lg:col-span-8 relative overflow-hidden rounded-3xl p-8 text-center shadow-lg border transition-all duration-500 flex flex-col justify-center
                        ${isProfitable
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-emerald-200'
                            : 'bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-400 shadow-rose-200'
                        }
                    `}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    <div className="absolute -top-20 -right-20 opacity-20">
                        <Wallet size={300} strokeWidth={0.5} />
                    </div>

                    <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center w-full h-full">
                        {/* 1. Profit Analysis */}
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className={`
                                inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2
                                ${isProfitable ? 'bg-emerald-400/30 text-emerald-50' : 'bg-rose-400/30 text-rose-50'}
                            `}>
                                {isProfitable ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {isProfitable ? 'Net Profit' : 'Net Loss'}
                            </div>

                            <div className="flex items-center gap-2 justify-center">
                                <h2 className="text-5xl md:text-6xl font-black tracking-tighter tabular-nums leading-none">
                                    {isProfitable ? '+' : ''}{formatNumber(profit)}<span className="text-2xl md:text-3xl align-top ml-1 font-bold opacity-80">{currency}</span>
                                </h2>
                                {/* Comparison Chip for Profit */}
                                {baselineMetrics && (
                                    <div className={`px-2 py-1 rounded-lg text-xs font-black self-start mt-2 ${profit > baselineMetrics.profit ? 'bg-white/20 text-white' : 'bg-black/20 text-white'}`}>
                                        {((profit - baselineMetrics.profit) / Math.abs(baselineMetrics.profit) * 100).toFixed(0)}%
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
                                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    <span className="block text-xs uppercase font-bold opacity-70">Margin</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold">{formatNumber(margin, 1)}%</span>
                                        <RenderDiff current={margin} baseline={baselineMetrics?.margin} className="!bg-white/20 !text-white" />
                                    </div>
                                </div>
                                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                                    <span className="block text-xs uppercase font-bold opacity-70">ROI</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold">{formatNumber(roi, 0)}%</span>
                                        <RenderDiff current={roi} baseline={baselineMetrics?.roi} className="!bg-white/20 !text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Volume Metrics */}
                        <div className="grid grid-cols-2 gap-3 w-full bg-black/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Total Leads</p>
                                <p className="text-2xl font-bold tracking-tight">{formatNumber(leads)}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Ad Spend</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(adCost, currency)}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Confirmed</p>
                                <p className="text-2xl font-bold tracking-tight">{formatNumber(confirmedOrders)}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-bold opacity-70 mb-0.5">Delivered</p>
                                <p className="text-2xl font-bold tracking-tight">{formatNumber(deliveredOrders)}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN: KEY METRICS (30%) */}
                <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                            <RenderDiff current={revenue} baseline={baselineMetrics?.revenue} />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{formatCurrency(revenue, currency)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cost</p>
                            <RenderDiff current={totalCost} baseline={baselineMetrics?.totalCost} inverse={true} />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{formatCurrency(totalCost, currency)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CPA (Real)</p>
                            <RenderDiff current={realCostPerDeliveredOrder} baseline={baselineMetrics?.realCostPerDeliveredOrder} inverse={true} />
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900">{formatCurrency(realCostPerDeliveredOrder, currency)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Cost Ratio</p>
                        <p className={`text-xl md:text-2xl font-black ${metrics.breakdown.adCost / revenue > 0.4 ? 'text-red-500' : 'text-gray-900'}`}>
                            {formatNumber((metrics.breakdown.adCost / (revenue || 1)) * 100, 1)}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">

                {/* FUNNEL HEALTH */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Zap size={20} />
                        </div>
                        <h3 className="font-bold text-gray-900">Funnel Health</h3>
                    </div>

                    <div className="space-y-6 relative">
                        {/* Leads */}
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-bold border border-gray-100 shadow-sm">
                                1
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-sm font-bold text-gray-700 uppercase">Leads</p>
                                    <p className="text-lg font-black text-gray-900">{formatNumber(leads)}</p>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} className="h-full bg-gray-300 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Confirmed */}
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="absolute left-[23px] -top-8 w-0.5 h-10 bg-gray-200 -z-10"></div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 shadow-sm">
                                2
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-sm font-bold text-blue-700 uppercase">Confirmed</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">{breakdown.confirmationRate}% Rate</span>
                                        <p className="text-lg font-black text-gray-900">{formatNumber(confirmedOrders)}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown.confirmationRate}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-blue-500 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Delivered */}
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="absolute left-[23px] -top-8 w-0.5 h-10 bg-gray-200 -z-10"></div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100 shadow-sm">
                                3
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-sm font-bold text-emerald-700 uppercase">Delivered</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">{breakdown.deliveryRate}% Rate</span>
                                        <p className="text-lg font-black text-gray-900">{formatNumber(deliveredOrders)}</p>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${breakdown.deliveryRate}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-emerald-500 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* COST BREAKDOWN */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                <TrendingDown size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Cost Analysis</h3>
                        </div>
                        {breakdown.totalUnits > 0 && (
                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold border border-indigo-100">
                                {formatNumber(breakdown.totalUnits)} Units Sold
                            </span>
                        )}
                    </div>

                    <div className="space-y-5">
                        {[
                            { label: 'Ad Spend', value: breakdown.adCost, color: 'bg-rose-500', bg: 'bg-rose-100', count: metrics.leads, countLabel: 'leads' },
                            { label: 'Product Cost', value: breakdown.totalProductCost, color: 'bg-indigo-500', bg: 'bg-indigo-100', count: metrics.totalUnits, countLabel: 'units' },
                            { label: 'Shipping', value: breakdown.totalShippingCost, color: 'bg-amber-500', bg: 'bg-amber-100', count: metrics.deliveredOrders, countLabel: 'orders' },
                            { label: 'Confirmation', value: breakdown.totalConfirmationCost, color: 'bg-purple-500', bg: 'bg-purple-100', count: metrics.deliveredOrders, countLabel: 'orders' },
                            { label: 'Returns', value: breakdown.totalReturnCost, color: 'bg-red-400', bg: 'bg-red-100', count: metrics.returnedOrders, countLabel: 'returns' },
                            { label: 'Other', value: breakdown.otherCosts, color: 'bg-gray-500', bg: 'bg-gray-100' }
                        ].filter(item => item.value > 0).map((item, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-end mb-1.5 font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-gray-600 text-sm">{item.label}</span>
                                        {item.count > 0 && (
                                            <span className="text-[10px] text-gray-400 font-bold">
                                                {formatNumber(item.count, 0)} {item.countLabel}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm">{formatCurrency(item.value, currency)}</span>
                                </div>
                                <div className={`w-full h-3 ${item.bg} rounded-full overflow-hidden relative`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.value / totalCost) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.1 * i }}
                                        className={`h-full ${item.color} rounded-full`}
                                    />
                                </div>
                                <div className="text-right mt-1">
                                    <span className="text-[10px] text-gray-400 font-bold">{((item.value / totalCost) * 100).toFixed(1)}% of total</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
