
import FunnelLeakageView from "@/components/FunnelLeakage/FunnelLeakageView";

export const metadata = {
    title: "Funnel Leakage Analysis | Ecommerce AI",
    description: "AI-powered customer journey analysis to identify and fix conversion drop-offs.",
};

export default function FunnelLeakagePage() {
    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <FunnelLeakageView />
        </div>
    );
}
