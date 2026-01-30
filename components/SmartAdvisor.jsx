import { AlertTriangle, CheckCircle, Sparkles, TrendingUp, Lightbulb, Info } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatting";

export default function SmartAdvisor({ adviceData, market }) {
    const { advice, warnings, breakEvenCPL } = adviceData;

    if (advice.length === 0 && warnings.length === 0) return null;

    // Identify the "Worst" metric based on warnings
    const worstWarning = warnings.find(w => w.type === 'critical') || warnings[0];

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50 h-full flex flex-col">
            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-8">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Sparkles size={22} className="fill-indigo-600" />
                </div>
                AI Smart Advisor
            </h3>

            <div className="space-y-4 flex-1">

                {/* 1. Critical Highlight (The "One Thing" to fix) */}
                {worstWarning && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 transition-all hover:shadow-md hover:border-red-200 group">
                        <div className="p-3 bg-red-100 rounded-xl h-fit w-fit group-hover:bg-red-200 transition-colors">
                            <AlertTriangle className="text-red-500" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-600 uppercase text-[10px] tracking-widest mb-1">
                                Critical Attention Needed
                            </h4>
                            <p className="font-bold text-gray-900 text-base leading-snug mb-2">
                                {worstWarning.message}
                            </p>
                            <p className="text-gray-500 text-xs font-medium flex items-center gap-1.5 bg-white/50 w-fit px-2 py-1 rounded-md">
                                <Info size={12} /> Impact: High Profit Loss
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. Other Warnings */}
                {warnings.filter(w => w !== worstWarning).slice(0, 2).map((warn, i) => (
                    <div key={`warn-${i}`} className="flex gap-4 items-start p-4 bg-orange-50 border border-orange-100 rounded-xl hover:bg-orange-100/50 transition-colors">
                        <div className="p-1.5 bg-orange-100 text-orange-500 rounded-lg mt-0.5">
                            <AlertTriangle size={16} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed">{warn.message}</p>
                    </div>
                ))}

                {/* 3. Growth Advice */}
                {advice.slice(0, 3).map((item, i) => (
                    <div key={`advice-${i}`} className="flex gap-4 items-start p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100/50 transition-colors">
                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg mt-0.5">
                            <TrendingUp size={16} />
                        </div>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed">{item}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest justify-center">
                <Lightbulb size={14} /> AI-Powered Analysis
            </div>
        </div>
    );
}
