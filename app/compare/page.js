
"use client";

import { useState, useEffect } from "react";
import ComparisonView from "@/components/ComparisonView";
import { MARKETS } from "@/lib/constants";
import ProtectedRoute from "@/components/ProtectedRoute";

function ComparePageContent() {
    // We re-use local storage scenarios
    const [scenarios, setScenarios] = useState([
        { id: 'baseline', name: 'Baseline', inputs: MARKETS["MA"].defaults, isBaseline: true }
    ]);
    const [activeMarketId, setActiveMarketId] = useState("MA");

    useEffect(() => {
        const saved = localStorage.getItem('codsim_scenarios');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setScenarios(parsed);
                }
            } catch (e) { console.error(e); }
        }
    }, []);

    const updateScenario = (id, updates) => {
        const updated = scenarios.map(s => s.id === id ? { ...s, ...updates } : s);
        setScenarios(updated);
        localStorage.setItem('codsim_scenarios', JSON.stringify(updated));
    };

    const addScenario = () => {
        const newId = `scenario-${Date.now()}`;
        const newScenario = {
            id: newId,
            name: `Scenario ${scenarios.length + 1}`,
            inputs: { ...scenarios[0].inputs },
            isBaseline: false
        };
        const updated = [...scenarios, newScenario];
        setScenarios(updated);
        localStorage.setItem('codsim_scenarios', JSON.stringify(updated));
    };

    const deleteScenario = (id) => {
        if (scenarios.length <= 1) return;
        const updated = scenarios.filter(s => s.id !== id);
        setScenarios(updated);
        localStorage.setItem('codsim_scenarios', JSON.stringify(updated));
    };

    const duplicateScenario = (id) => {
        const source = scenarios.find(s => s.id === id);
        if (!source) return;
        const newId = `copy-${Date.now()}`;
        const updated = [...scenarios, {
            ...source,
            id: newId,
            name: `${source.name} (Copy)`,
            isBaseline: false
        }];
        setScenarios(updated);
        localStorage.setItem('codsim_scenarios', JSON.stringify(updated));
    };

    return (
        <div className="max-w-[1800px] mx-auto py-8 px-4 animate-in fade-in duration-300 bg-slate-100 min-h-screen">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Scenario Comparison</h1>
                <p className="text-slate-500">Compare multiple strategies side-by-side to find the winner.</p>
            </div>

            <ComparisonView
                scenarios={scenarios}
                updateScenario={updateScenario}
                addScenario={addScenario}
                deleteScenario={deleteScenario}
                duplicateScenario={duplicateScenario}
                markets={MARKETS}
                activeMarketId={activeMarketId}
            />
        </div>
    );
}

export default function ComparePage() {
    return (
        <ProtectedRoute>
            <ComparePageContent />
        </ProtectedRoute>
    );
}
