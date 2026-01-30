
"use client";

import { useState, useEffect } from "react";
import {
    BarChart3, ArrowRight, AlertTriangle, CheckCircle,
    TrendingDown, Zap, Search, X, ChevronRight, Activity, MousePointerClick
} from "lucide-react";
import { generateFunnelData, analyzeFullFunnel, analyzeSpecificStage, INDUSTRY_BENCHMARKS } from "@/lib/funnelAnalysis";
import { motion, AnimatePresence } from "framer-motion";

export default function FunnelLeakageView() {
    const [data, setData] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [selectedStage, setSelectedStage] = useState(null);
    const [stageInsights, setStageInsights] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [loadingStage, setLoadingStage] = useState(false);

    // Initial Load
    useEffect(() => {
        const funnelData = generateFunnelData();
        setData(funnelData);

        // Trigger overall analysis
        setLoadingAnalysis(true);
        analyzeFullFunnel(funnelData)
            .then(res => {
                setAnalysis(res);
                setLoadingAnalysis(false);
            })
            .catch(err => {
                console.error(err);
                setLoadingAnalysis(false);
            });
    }, []);

    // Handle Stage Click
    const handleStageClick = async (stage, index) => {
        if (selectedStage?.name === stage.name) {
            // Deselect
            setSelectedStage(null);
            setStageInsights(null);
            return;
        }

        setSelectedStage({ ...stage, index });
        setStageInsights(null);
        setLoadingStage(true);

        // Get context
        const prev = index > 0 ? data.stages[index - 1] : null;
        const next = index < data.stages.length - 1 ? data.stages[index + 1] : null;

        try {
            const insights = await analyzeSpecificStage(stage, prev, next);
            setStageInsights(insights);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStage(false);
        }
    };

    if (!data) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <span className="p-2 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-200">
                            <TrendingDown size={24} />
                        </span>
                        Funnel Leakage Analysis
                    </h1>
                    <p className="text-slate-500 mt-1">AI-powered detection of customer drop-off points.</p>
                </div>

                {analysis && (
                    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-right border-r border-slate-100 pr-4">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Potential Uplift</div>
                            <div className="text-emerald-600 font-black text-xl">{analysis.revenueImpact?.uplift || "..."}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">Est. Revenue</div>
                            <div className="text-indigo-600 font-black text-xl">{analysis.revenueImpact?.potential || "..."}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Summary Section */}
            {analysis ? (
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Activity size={120} />
                    </div>

                    <div className="relative z-10 grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-indigo-300 uppercase text-xs tracking-wider">
                                <Zap size={14} /> AI Executive Summary
                            </h3>
                            <p className="text-lg leading-relaxed font-medium text-slate-100">
                                {analysis.summary}
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {analysis.criticalIssues?.map((issue, i) => (
                                    <span key={i} className="px-3 py-1 bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-200 text-xs font-bold flex items-center gap-2">
                                        <AlertTriangle size={12} />
                                        {issue.stage}: {issue.impact}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex flex-col justify-center items-center text-center">
                            <div className="text-4xl font-black mb-1 text-emerald-400">
                                {data.totalConversionRate}%
                            </div>
                            <div className="text-xs text-indigo-200 uppercase font-bold mb-3">Current Conversion Rate</div>
                            <div className="text-xs bg-slate-800/50 px-2 py-1 rounded inline-flex items-center gap-1">
                                Benchmark: <span className="text-white font-bold">{data.benchmarkConversionRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-100 rounded-2xl h-48 animate-pulse"></div>
            )}

            {/* Main Interactive Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Visualization */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="font-bold text-slate-800 mb-6 flex justify-between items-center">
                            <span>Conversion Funnel</span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">Click stage for AI details</span>
                        </h2>

                        <div className="space-y-4 relative">
                            {data.stages.map((stage, idx) => {
                                const prevUsers = idx === 0 ? stage.users : data.stages[idx - 1].users;
                                const retention = idx === 0 ? 100 : Math.round((stage.users / prevUsers) * 100);
                                const isSelected = selectedStage?.name === stage.name;

                                // Color logic based on drop-off
                                const dropOffSeverity = stage.dropOffRate > 70 ? 'bg-rose-500' : stage.dropOffRate > 40 ? 'bg-amber-500' : 'bg-emerald-500';
                                const widthPercent = (stage.users / data.stages[0].users) * 100;

                                return (
                                    <div
                                        key={stage.name}
                                        onClick={() => handleStageClick(stage, idx)}
                                        className={`group relative cursor-pointer transition-all duration-300 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'}`}
                                    >
                                        <div className={`
                                            relative h-16 rounded-xl overflow-hidden border-2 transition-colors
                                            ${isSelected ? 'border-indigo-600 shadow-md ring-4 ring-indigo-50 bg-indigo-50' : 'border-slate-100 bg-slate-50 group-hover:border-slate-300'}
                                        `}>
                                            {/* Bar Fill */}
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.max(widthPercent, 2)}%` }}
                                                transition={{ duration: 1, delay: idx * 0.1 }}
                                                className={`absolute top-0 left-0 h-full opacity-20 ${dropOffSeverity}`}
                                            />

                                            {/* Content */}
                                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}>
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <div className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{stage.name}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">{stage.timeSpent} avg</div>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`font-black text-lg ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>
                                                        {stage.users.toLocaleString()}
                                                    </div>
                                                    {idx > 0 && (
                                                        <div className="text-[10px] font-bold text-slate-500 flex items-center justify-end gap-1">
                                                            <span>{retention}% kept</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Drop-off Indicator (Floating) */}
                                        {idx < data.stages.length - 1 && (
                                            <div className="absolute -bottom-4 right-8 z-10 transform translate-y-1/2">
                                                <div className="bg-white border border-rose-100 shadow-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold text-rose-600">
                                                    <TrendingDown size={10} />
                                                    {stage.dropOff.toLocaleString()} lost
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Detail Panel */}
                <div className="lg:col-span-5">
                    <AnimatePresence mode="wait">
                        {selectedStage ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden sticky top-6"
                            >
                                {/* Panel Header */}
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Stage Analysis</div>
                                        <h3 className="text-xl font-black text-slate-900">{selectedStage.name}</h3>
                                    </div>
                                    <button onClick={() => setSelectedStage(null)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                {/* Panel Body */}
                                <div className="p-6 space-y-6">
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                                            <div className="text-xs text-rose-600 font-bold uppercase">Drop-off Rate</div>
                                            <div className="text-2xl font-black text-rose-700">{selectedStage.dropOffRate}%</div>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="text-xs text-slate-500 font-bold uppercase">Competitor Benchmark</div>
                                            <div className="text-2xl font-black text-slate-700">~{getBenchmark(selectedStage.index)}%</div>
                                        </div>
                                    </div>

                                    {/* AI Recommendations */}
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <Zap size={16} className="text-amber-500" />
                                            AI Recommendations
                                        </h4>

                                        {loadingStage ? (
                                            <div className="space-y-3 animate-pulse">
                                                <div className="h-24 bg-slate-100 rounded-xl"></div>
                                                <div className="h-24 bg-slate-100 rounded-xl"></div>
                                            </div>
                                        ) : stageInsights ? (
                                            <div className="space-y-3">
                                                {stageInsights.recommendations?.map((rec, i) => (
                                                    <div key={i} className="group border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h5 className="font-bold text-slate-900 text-sm group-hover:text-indigo-700">{rec.title}</h5>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${rec.effort === 'Low' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                                {rec.effort} Effort
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                                                            {rec.what}
                                                        </p>
                                                        <div className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-500 flex gap-1">
                                                            <span className="font-bold">Why:</span> {rec.why}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 text-sm">
                                                Could not load insights.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Action */}
                                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                                    <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                        Generate Implementation Plan <ArrowRight size={16} />
                                    </button>
                                </div>

                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                    <MousePointerClick size={32} className="text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">Select a Stage</h3>
                                <p className="text-sm text-slate-400 max-w-xs">
                                    Click on any funnel stage on the left to reveal detailed AI analysis and improvement recommendations.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}

// Helper
const getBenchmark = (idx) => {
    // Simplified mapping based on prompt
    const map = [45, 15, 70, 85, 90, 95];
    return idx < map.length ? map[idx] : 50;
};
