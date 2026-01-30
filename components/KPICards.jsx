import { TrendingUp, TrendingDown, DollarSign, HelpCircle } from "lucide-react";

export default function KPICards({ metrics, currency }) {
    const { profit, roi, margin, revenue, adCost, realCostPerDeliveredOrder } = metrics;

    const isProfitable = profit > 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* 1. Net Profit */}
            <div className={`p-4 rounded-xl border ${isProfitable ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <p className="text-sm text-slate-500 font-medium mb-1">Net Profit</p>
                <p className={`text-2xl font-bold ${isProfitable ? 'text-emerald-700' : 'text-red-700'}`}>
                    {profit.toLocaleString()} <span className="text-sm font-normal">{currency}</span>
                </p>
            </div>

            {/* 2. Revenue */}
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 font-medium mb-1">Revenue</p>
                <p className="text-2xl font-bold text-slate-900">
                    {revenue.toLocaleString()} <span className="text-sm font-normal">{currency}</span>
                </p>
            </div>

            {/* 3. Total Ad Cost */}
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 font-medium mb-1">Total Ad Cost</p>
                <p className="text-2xl font-bold text-slate-900">
                    {adCost.toLocaleString()} <span className="text-sm font-normal">{currency}</span>
                </p>
            </div>

            {/* 4. Real Cost Per Delivered Order (NEW) */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 shadow-sm relative group">
                <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm text-indigo-700 font-medium">Real Cost / Order</p>
                    <HelpCircle size={14} className="text-indigo-400 cursor-help" />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-center">
                        Low confirmation or delivery increases real cost per delivered order.
                    </div>
                </div>
                <p className="text-2xl font-bold text-indigo-700">
                    {realCostPerDeliveredOrder?.toFixed(0) || 0} <span className="text-sm font-normal">{currency}</span>
                </p>
            </div>

            {/* 5. ROI */}
            <div className={`p-4 rounded-xl border ${roi > 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                <p className="text-sm text-slate-500 font-medium mb-1">ROI (ROAS)</p>
                <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold ${roi > 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {roi.toFixed(0)}%
                    </p>
                    {roi > 0 ? <TrendingUp size={16} className="text-blue-600" /> : <TrendingDown size={16} className="text-orange-600" />}
                </div>
            </div>

            {/* 6. Margin */}
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                <p className="text-sm text-slate-500 font-medium mb-1">Margin</p>
                <p className="text-2xl font-bold text-slate-900">{margin.toFixed(1)}%</p>
            </div>
        </div>
    );
}
