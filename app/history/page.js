
"use client";

import { useState, useEffect } from "react";
import HistoryDashboard from "@/components/HistoryDashboard";
import { MARKETS } from "@/lib/constants";
import { getHistory, deleteHistoryItem } from "@/lib/historyManager";
import { useAuth } from "@/contexts/AuthContext";
import { getSimulations, deleteSimulation } from "@/lib/firebase";

export default function HistoryPage() {
    const [history, setHistory] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            if (currentUser) {
                try {
                    const data = await getSimulations(currentUser.uid);
                    // Map Firebase data to compatible format if needed
                    // Firebase returns { id, ...data }, structure should align with HistoryDashboard expects
                    setHistory(data.map(d => ({ ...d, id: d.id, timestamp: d.createdAt?.seconds * 1000 || Date.now() })));
                } catch (error) {
                    console.error("Error loading history:", error);
                }
            } else {
                setHistory(getHistory());
            }
        };
        loadData();
    }, [currentUser]);

    const handleDelete = async (id) => {
        if (currentUser) {
            if (confirm('Delete this simulation from cloud?')) {
                await deleteSimulation(id);
                // Reload
                const data = await getSimulations(currentUser.uid);
                setHistory(data.map(d => ({ ...d, id: d.id, timestamp: d.createdAt?.seconds * 1000 || Date.now() })));
            }
        } else {
            const updated = deleteHistoryItem(id);
            setHistory(updated);
        }
    };

    const handleRestore = (inputs) => {
        // Since we are on a separate page, we can't easily push state to '/' unless we use a URL param or Context.
        // For simplicity in this platform version, we'll alert the user or maybe redirect with query param later.
        // But the requested flow was "Load Settings" -> which implies redirecting to simulator.

        // Let's implement a simple redirect with LocalStorage "draft" logic or just params.
        // Quickest way: Save to a specific 'active_draft' in LS and redirect.

        // However, for now, let's just copy to clipboard or show a toast.
        // Or better, update the 'baseline' scenario in LS and redirect.

        const scenarios = JSON.parse(localStorage.getItem('codsim_scenarios') || '[]');
        if (scenarios.length > 0) {
            scenarios[0].inputs = inputs;
            localStorage.setItem('codsim_scenarios', JSON.stringify(scenarios));
            window.location.href = '/';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Campaign History</h1>
                <p className="text-slate-500">Track your past simulations, best performers, and revenue trends.</p>
            </div>

            <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-200">
                <HistoryDashboard
                    history={history}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    currency="MAD"
                />
            </div>
        </div>
    );
}
