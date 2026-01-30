import { ArrowRight, DollarSign, TrendingUp, Shield, Target, Zap } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/formatting";

export default function ScenarioComparison({ scenarios, currency }) {
    const [activeTab, setActiveTab] = useState("realistic");

    if (!scenarios) return null;

    const { conservative, realistic, aggressive } = scenarios;

    // Fallback if generic keys are used from old logic 'current', 'improved', 'optimized'
    const safeScenarios = {
        conservative: conservative || scenarios.current,
        realistic: realistic || scenarios.improved,
        aggressive: aggressive || scenarios.optimized
    };

    const tabs = [
        { id: "conservative", label: "Conservative", icon: Shield, color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200" },
        { id: "realistic", label: "Realistic", icon: Target, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
        { id: "aggressive", label: "Aggressive", icon: Zap, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" }
    ];

    const activeScenario = safeScenarios[activeTab];

    if (!activeScenario) return null;

    const activeStyle = tabs.find(t => t.id === activeTab);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <TrendingUp className="text-slate-400" />
                    Scenario Planning
                </h3>
            </div>

            {/* TABS */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-slate-400'} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ACTIVE SCENARIO CARD */}
            <div className={`rounded-xl p-6 border ${activeStyle.bg} ${activeStyle.border}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeStyle.color}`}>
                            {activeStyle.label} Case
                        </span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1">
                            {formatCurrency(activeScenario.profit, currency)}
                        </h4>
                        <p className="text-sm text-slate-600 font-medium">Net Profit</p>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="text-xs text-slate-500">
                            Profit Margin: <span className="font-bold text-slate-900">{formatNumber(activeScenario.margin, 1)}%</span>
                        </div>
                        <div className="text-xs text-slate-500">
                            Real Cost/Order: <span className="font-bold text-slate-900">{formatCurrency(activeScenario.realCostPerDeliveredOrder, currency)}</span>
                        </div>
                    </div>
                </div>

                {/* Scenario Details */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-6 pt-6 border-t border-slate-200/50">
                    <div>
                        <span className="block text-slate-400 mb-1">Confirmation</span>
                        <span className="font-bold text-slate-700">{formatNumber(activeScenario.breakdown.confirmationRate, 0)}%</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 mb-1">Delivery</span>
                        <span className="font-bold text-slate-700">{formatNumber(activeScenario.breakdown.deliveryRate, 0)}%</span>
                    </div>
                    <div>
                        <span className="block text-slate-400 mb-1">Ads (CPL)</span>
                        <span className="font-bold text-slate-700">
                            {/* We don't have direct CPL access here cleanly, calculate it or pass inputs. 
                                For now, approximations. Real Cost Per Delivered covers it but CPL is input.
                                Let's show Delivered Orders count.
                            */}
                            {formatNumber(activeScenario.deliveredOrders)} Del.
                        </span>
                    </div>
                </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 italic">
                {activeTab === 'conservative' && "Baseline based on your current inputs."}
                {activeTab === 'realistic' && "Assumes +10% operational efficiency."}
                {activeTab === 'aggressive' && "Assumes +20% efficiency & -10% ad costs."}
            </p>
        </div>
    );
}
