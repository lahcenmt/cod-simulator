import { Share2, Download, MousePointerClick, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

export default function ActionButtons({ metrics, currency, inputs }) {

    const handlePrint = () => {
        window.print();
    };

    const handleCopyLink = () => {
        // Simple encoding of state to URL params (concept)
        const params = new URLSearchParams();
        Object.keys(inputs).forEach(key => {
            if (typeof inputs[key] === 'object') {
                params.set(key, JSON.stringify(inputs[key]));
            } else {
                params.set(key, inputs[key]);
            }
        });

        // In a real app we would update the URL or use a dedicated sharing service
        // For now, we simulate the action
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard (Simulation)");
    };

    const handleExportCSV = () => {
        // Create CSV content
        const rows = [
            ["Metric", "Value"],
            ["Total Revenue", `${metrics.revenue} ${currency}`],
            ["Total Cost", `${metrics.totalCost} ${currency}`],
            ["Net Profit", `${metrics.profit} ${currency}`],
            ["Delivered Orders", metrics.deliveredOrders],
            ["Ad Cost", metrics.adCost],
            ["Product Cost", metrics.totalProductCost],
            ["Shipping Cost", metrics.totalShippingCost],
            ["Confirmation Cost", metrics.totalConfirmationCost]
        ];

        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "profit_simulation.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
                <Printer size={16} /> Print Report
            </button>
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
                <Download size={16} /> Export Excel
            </button>
            <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
                <Share2 size={16} /> Share Results
            </button>
        </div>
    );
}
