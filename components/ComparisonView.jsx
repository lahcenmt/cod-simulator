import { Plus, Trophy, ArrowRight } from "lucide-react";
import ScenarioColumn from "./ScenarioColumn";
import { useMemo } from "react";
import { calculateMetrics } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatting";

export default function ComparisonView({
    scenarios,
    updateScenario,
    addScenario,
    deleteScenario,
    duplicateScenario,
    markets,
    activeMarketId
}) {
    // Identify best performing scenario
    const bestScenario = useMemo(() => {
        if (scenarios.length === 0) return null;
        let best = scenarios[0];
        let maxProfit = -Infinity;

        scenarios.forEach(s => {
            const m = calculateMetrics(s.inputs);
            if (m.profit > maxProfit) {
                maxProfit = m.profit;
                best = { ...s, profit: m.profit };
            }
        });
        return best;
    }, [scenarios]);

    const activeMarket = markets[activeMarketId];

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] bg-[#F8F9FB] animate-in fade-in duration-500">

            {/* 1. Comparison Summary */}
            <div className="flex-none px-6 py-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                            <Trophy size={24} className="fill-emerald-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                Winning Strategy: <span className="text-emerald-600">{bestScenario?.name}</span>
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Generates <span className="font-bold text-gray-900">{formatCurrency(bestScenario?.profit, activeMarket.currency)}</span> in Net Profit.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={addScenario}
                        disabled={scenarios.length >= 4}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-indigo-200"
                    >
                        <Plus size={18} /> Add Scenario
                    </button>
                </div>
            </div>

            {/* 2. Scenarios Horizontal Scroll */}
            <div className="flex-1 overflow-x-auto pb-6 px-6 flex gap-6 items-start">

                {scenarios.map((scenario, index) => (
                    <div key={scenario.id} className="w-[400px] flex-shrink-0 h-full rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white ring-1 ring-gray-100/50">
                        <ScenarioColumn
                            scenario={scenario}
                            isBaseline={scenario.isBaseline || index === 0}
                            updateScenario={updateScenario}
                            deleteScenario={deleteScenario}
                            duplicateScenario={duplicateScenario}
                            market={markets[activeMarketId]}
                            fullMarkets={markets}
                        />
                    </div>
                ))}

                {/* Add New Placeholder column if < 3 */}
                {scenarios.length < 4 && (
                    <button
                        onClick={addScenario}
                        className="w-[100px] flex-shrink-0 h-full max-h-[600px] rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-indigo-600 transition-all group bg-gray-50/50"
                    >
                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 group-hover:bg-indigo-100 group-hover:border-indigo-200 flex items-center justify-center transition-colors shadow-sm">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm">Add Scenario</span>
                    </button>
                )}
            </div>
        </div>
    );
}
