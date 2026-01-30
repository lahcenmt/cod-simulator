import { TrendingUp, ArrowRight, DollarSign, Target } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

export default function ProfitHelper({ levers, currency }) {
    if (!levers || levers.length === 0) return null;

    // We take the top 3 impactful levers
    const topLevers = levers.slice(0, 3);

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50 h-full flex flex-col">
            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-8">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                    <Target size={22} className="text-blue-600" />
                </div>
                Profit Growth Levers
            </h3>

            <div className="space-y-6 flex-1">
                {topLevers.map((lever, index) => (
                    <div key={index} className="group relative pl-6 border-l-2 border-gray-100 hover:border-blue-500 transition-all duration-300">
                        {/* Interactive Dot */}
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-200 group-hover:bg-blue-500 transition-colors" />

                        <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-gray-900 text-base">{lever.name}</span>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                                +{formatCurrency(lever.profitIncrease || lever.impact || 0, currency)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            {lever.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-center gap-3 text-blue-700 text-sm font-bold">
                    <TrendingUp size={16} />
                    <span>Focus on these to boost Net Profit</span>
                </div>
            </div>
        </div>
    );
}
