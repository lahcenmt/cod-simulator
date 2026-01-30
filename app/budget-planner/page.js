
import BudgetPlannerView from "@/components/BudgetPlanner/BudgetPlannerView";

export const metadata = {
    title: "Smart Budget Allocator | Ecommerce Simulator",
    description: "AI-powered marketing budget planning and optimization.",
};

export default function BudgetPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <BudgetPlannerView />
        </div>
    );
}
