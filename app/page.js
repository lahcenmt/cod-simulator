"use client";

import { useState, useMemo, useEffect } from "react";
import { MARKETS } from "@/lib/constants";
import { calculateMetrics, generateScenarios, getAdvice, rankProfitLevers, calculateBreakEvenMetrics } from "@/lib/calculations";
import InputForm from "@/components/InputForm";
import ResultsPanel from "@/components/ResultsPanel";
import SmartAdvisor from "@/components/SmartAdvisor";
import ProfitHelper from "@/components/ProfitHelper";
import BreakEvenCard from "@/components/BreakEvenCard";
import Link from "next/link";
import { TrendingUp, LayoutDashboard, Calculator, Activity, ChevronRight, Download, Save, Menu, ArrowRightLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { saveSimulation as saveToCloud } from "@/lib/firebase";

export default function Home() {
  const { currentUser } = useAuth();
  const [activeMarketId, setActiveMarketId] = useState("MA");

  // SCENARIO STATE MANAGEMENT
  const [scenarios, setScenarios] = useState([
    { id: 'baseline', name: 'Baseline', inputs: MARKETS["MA"].defaults, isBaseline: true }
  ]);
  const [activeScenarioId, setActiveScenarioId] = useState('baseline');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Derived state
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const inputs = activeScenario.inputs;

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('codsim_scenarios');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge saved inputs with defaults to ensure all fields exist (robust migration)
          const hydratedScenarios = parsed.map(s => ({
            ...s,
            inputs: { ...MARKETS[activeMarketId].defaults, ...s.inputs }
          }));
          setScenarios(hydratedScenarios);
          setActiveScenarioId(hydratedScenarios[0].id);
        }
      } catch (e) { console.error("Failed to load scenarios:", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('codsim_scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  // Actions
  const updateScenario = (id, updates) => {
    setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const setInputs = (valOrFn) => {
    const newInputs = typeof valOrFn === 'function' ? valOrFn(inputs) : valOrFn;
    updateScenario(activeScenarioId, { inputs: newInputs });
  };

  const setMarket = (id) => {
    setActiveMarketId(id);
    const defaults = MARKETS[id].defaults;
    setInputs(defaults);
  };

  const activeMarket = MARKETS[activeMarketId];

  // Real-time Metrics
  const metrics = useMemo(() => calculateMetrics(inputs), [inputs]);
  const adviceData = useMemo(() => getAdvice(inputs, activeMarketId), [inputs, activeMarketId]);
  const profitLevers = useMemo(() => rankProfitLevers(inputs), [inputs]);
  const breakEven = useMemo(() => calculateBreakEvenMetrics(inputs, metrics), [inputs, metrics]);
  const metricsWithBE = { ...metrics, breakEvenAnalysis: breakEven };

  const addScenario = () => {
    const newId = `scenario-${Date.now()}`;
    const newScenario = {
      ...activeScenario,
      id: newId,
      name: `Scenario ${scenarios.length + 1}`,
      isBaseline: false,
      inputs: { ...activeScenario.inputs }
    };
    setScenarios([...scenarios, newScenario]);
    setActiveScenarioId(newId);
  };

  const handleSaveSimulation = async () => {
    if (currentUser) {
      try {
        await saveToCloud(currentUser.uid, {
          name: inputs.name || `Simulation ${new Date().toLocaleString()}`,
          inputs,
          results: {
            profit: metrics.profit,
            revenue: metrics.revenue,
            roi: metrics.roi,
            margin: metrics.margin
          }, // Simplified for demo
          market: activeMarket.id,
          scenarioName: activeScenario.name
        });
        alert("Simulation saved to your Cloud account!");
      } catch (e) {
        console.error(e);
        alert("Error saving to cloud.");
      }
    } else {
      const { saveSimulation } = require("@/lib/historyManager");
      const newItem = saveSimulation(inputs, metrics, activeScenario.name);
      if (newItem) alert("Simulation saved locally! Sign in to sync across devices.");
    }
  };

  const handleExport = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", `${metrics.revenue} ${activeMarket.currency}`],
      ["Net Profit", `${metrics.profit} ${activeMarket.currency}`],
      ["Delivered Orders", metrics.deliveredOrders],
      ["Leads", metrics.leads],
    ];
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "profit_simulation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Baseline Comparison
  const baselineScenario = scenarios.find(s => s.isBaseline) || scenarios[0];
  const baselineMetrics = useMemo(() => {
    if (activeScenarioId === baselineScenario.id) return null;
    return calculateMetrics(baselineScenario.inputs);
  }, [baselineScenario, activeScenarioId]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans pb-32 lg:pb-12">

      {/* 1. Page Content Container */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pt-24">

        <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8">

          {/* LEFT COLUMN: INPUTS (Sticky Sidebar) */}
          <aside className="w-full lg:w-[360px] flex-shrink-0 lg:sticky lg:top-24 z-10">
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-200 overflow-hidden">
              <InputForm
                inputs={inputs}
                setInputs={setInputs}
                market={activeMarket}
                setMarket={setMarket}
                markets={MARKETS}
                metrics={metrics}
                // Scenario Management
                scenarios={scenarios}
                activeScenarioId={activeScenarioId}
                setActiveScenarioId={setActiveScenarioId}
                addScenario={addScenario}
              />
            </div>
          </aside>

          {/* RIGHT COLUMN: RESULTS & ANALYSIS */}
          <main className="flex-1 min-w-0 space-y-8">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Simulator Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time profitability engine for {activeMarket.name}.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/compare">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 rounded-xl text-sm font-bold transition-all hover:shadow-sm">
                    <ArrowRightLeft size={16} />
                    <span>Compare Scenarios</span>
                  </button>
                </Link>
                <button
                  onClick={handleSaveSimulation}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold transition-all"
                >
                  <Save size={16} />
                  <span>Save Run</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                  <Download size={16} />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* 1. Results Panel (Hero) */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ResultsPanel metrics={metricsWithBE} currency={activeMarket.currency} baselineMetrics={baselineMetrics} />
            </section>

            {/* 2. Break Even & Analysis */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <BreakEvenCard metrics={metricsWithBE} currency={activeMarket.currency} inputs={inputs} />
            </section>

            {/* 3. Promo Cards Grid */}
            <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              {/* Budget Planner Promo */}
              <Link href="/budget-planner" className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="absolute top-0 right-[-20px] opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                  <Calculator size={150} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                    <Calculator size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Budget Allocator</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">AI-powered budget strategies and ROI forecasting specific to your market.</p>
                  <div className="flex items-center text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all">
                    Open Calculator <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>

              {/* Funnel Promo */}
              <Link href="/funnel-leakage" className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="absolute top-0 right-[-20px] opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                  <Activity size={150} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <Activity size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Funnel Leakage</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">Identify drop-off points and fix leaks in your conversion funnel.</p>
                  <div className="flex items-center text-sm font-bold text-emerald-600 group-hover:gap-2 transition-all">
                    Analyze Funnel <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>
              </Link>
            </div>

            {/* 4. AI Advisor */}
            <section className="grid xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
              <SmartAdvisor adviceData={adviceData} market={activeMarket} />
              <ProfitHelper levers={profitLevers} currency={activeMarket.currency} />
            </section>
          </main>
        </div>
      </div>

      {/* Mobile Sticky Footer Result */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 lg:hidden z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Net Profit</p>
          <div className={`text-xl font-black ${metrics.profit > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {metrics.profit.toLocaleString()} {activeMarket.currency}
          </div>
        </div>
        <button
          onClick={handleExport} // Simple action for now
          className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}
