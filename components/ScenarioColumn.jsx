import { Trash2, Copy, TrendingUp, DollarSign } from "lucide-react";
import InputForm from "./InputForm";
import { formatCurrency, formatNumber } from "@/lib/formatting";
import { useMemo } from "react";
import { calculateMetrics } from "@/lib/calculations";

export default function ScenarioColumn({
    scenario,
    updateScenario,
    deleteScenario,
    duplicateScenario,
    market,
    fullMarkets,
    isBaseline
}) {
    const { id, name, inputs } = scenario;

    const metrics = useMemo(() => calculateMetrics(inputs), [inputs]);

    const setInputs = (newInputsOrFn) => {
        // Handle both functional updates and direct objects
        const newInputs = typeof newInputsOrFn === 'function'
            ? newInputsOrFn(inputs)
            : newInputsOrFn;

        updateScenario(id, { inputs: newInputs });
    };

    const setMarket = (marketId) => {
        const defaults = fullMarkets[marketId].defaults;
        updateScenario(id, { inputs: defaults });
    };

    return (
        <div className="flex flex-col h-full bg-white relative">

            {/* 1. Scenario Header */}
            <div className={`p-5 sticky top-0 bg-white z-20 border-b border-gray-100 ${isBaseline ? 'bg-indigo-50/30' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => updateScenario(id, { name: e.target.value })}
                        className="font-bold text-gray-900 bg-transparent hover:bg-gray-100 focus:bg-white rounded px-2 -ml-2 py-1 w-full text-lg border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                    />
                    <div className="flex items-center gap-1.5 ml-2">
                        <button onClick={() => duplicateScenario(id)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Duplicate">
                            <Copy size={16} />
                        </button>
                        {!isBaseline && (
                            <button onClick={() => deleteScenario(id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Key Metrics Summary */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`p-4 rounded-xl border ${metrics.profit > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className={`p-1 rounded-md ${metrics.profit > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <DollarSign size={12} />
                            </div>
                            <span className={`text-[10px] uppercase font-bold ${metrics.profit > 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Profit</span>
                        </div>
                        <p className={`text-2xl font-black ${metrics.profit > 0 ? 'text-emerald-700' : 'text-red-600'} tracking-tight`}>
                            {formatCurrency(metrics.profit, market.currency)}
                        </p>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="p-1 rounded-md bg-gray-100 text-gray-600">
                                <TrendingUp size={12} />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-gray-500">ROI</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900">{formatNumber(metrics.roi, 0)}%</p>
                    </div>
                </div>
            </div>

            {/* 3. Inputs */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* We pass a custom className or container style if needed, but InputForm fits 100% width */}
                <InputForm
                    inputs={inputs}
                    setInputs={setInputs}
                    market={market}
                    setMarket={setMarket}
                    markets={fullMarkets}
                    metrics={metrics}
                />
            </div>
        </div>
    );
}
