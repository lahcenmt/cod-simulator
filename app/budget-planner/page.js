"use client";

import BudgetPlannerView from "@/components/BudgetPlanner/BudgetPlannerView";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function BudgetPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <BudgetPlannerView />
            </div>
        </ProtectedRoute>
    );
}
