
"use client";

import { useState, useEffect } from "react";
import ComparisonView from "@/components/ComparisonView";
import { MARKETS } from "@/lib/constants";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { db, getScenarios } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { useDebouncedEffect } from "@/lib/hooks";

function ComparePageContent() {
    const { currentUser } = useAuth();
    const [scenarios, setScenarios] = useState([
        { id: 'baseline', name: 'Baseline', inputs: MARKETS["MA"].defaults, isBaseline: true }
    ]);
    const [activeMarketId, setActiveMarketId] = useState("MA");
    const [cloudSynced, setCloudSynced] = useState(false);

    useEffect(() => {
        async function load() {
            if (currentUser) {
                try {
                    const cloudScenes = await getScenarios(currentUser.uid);
                    if (cloudScenes && cloudScenes.length > 0) {
                        setScenarios(cloudScenes);
                        setCloudSynced(true);
                        return;
                    }
                } catch (e) {
                    console.error("Error loading cloud scenarios:", e);
                }
            }
            const saved = localStorage.getItem('codsim_scenarios');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setScenarios(parsed);
                    }
                } catch (e) { console.error(e); }
            }
            setCloudSynced(true);
        }
        load();
    }, [currentUser]);

    // Cloud Auto-Sync
    useDebouncedEffect(() => {
        if (!currentUser || !cloudSynced || scenarios.length === 0) return;
        const syncToCloud = async () => {
            try {
                for (const s of scenarios) {
                    await setDoc(doc(db, 'users', currentUser.uid, 'scenarios', s.id), {
                        ...s,
                        updatedAt: Date.now()
                    }, { merge: true });
                }
            } catch (e) { console.error("Error syncing scenarios", e); }
        };
        syncToCloud();
    }, 1500, [scenarios, currentUser, cloudSynced]);

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

    const deleteScenario = async (id) => {
        if (scenarios.length <= 1) return;
        const updated = scenarios.filter(s => s.id !== id);
        setScenarios(updated);
        localStorage.setItem('codsim_scenarios', JSON.stringify(updated));
        
        if (currentUser) {
            try {
                await deleteDoc(doc(db, 'users', currentUser.uid, 'scenarios', id));
            } catch(e) { console.error(e); }
        }
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
