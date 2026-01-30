"use client";

import FunnelLeakageView from "@/components/FunnelLeakage/FunnelLeakageView";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function FunnelLeakagePage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <FunnelLeakageView />
            </div>
        </ProtectedRoute>
    );
}
