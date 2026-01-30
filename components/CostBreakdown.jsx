import { DollarSign, Package, Truck, Target, CheckCircle } from "lucide-react";

export default function CostBreakdown({ metrics, currency }) {
    const {
        revenue,
        totalProductCost,
        totalShippingCost,
        adCost,
        totalReturnCost,
        totalConfirmationCost,
        totalCost
    } = metrics;

    if (!metrics) return null;

    const CostItem = ({ label, value, icon: Icon, color, percent }) => (
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${color.bg}`}>
                    <Icon size={16} className={color.text} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">{label}</p>
                    <p className="text-xs text-slate-400">{percent}% of Total Cost</p>
                </div>
            </div>
            <p className="font-bold text-slate-900">
                {value.toLocaleString()} <span className="text-xs font-normal text-slate-500">{currency}</span>
            </p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign className="text-slate-400" /> Cost Breakdown
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Visual Bar Chart */}
                <div className="flex flex-col justify-center space-y-4">
                    <div className="flex justify-between text-sm font-medium text-slate-600 mb-1">
                        <span>Costs Analysis</span>
                        <span>Total: {totalCost.toLocaleString()} {currency}</span>
                    </div>

                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(adCost / totalCost) * 100}%` }} className="bg-red-400" title="Ads" />
                        <div style={{ width: `${(totalProductCost / totalCost) * 100}%` }} className="bg-blue-400" title="Product" />
                        <div style={{ width: `${(totalShippingCost / totalCost) * 100}%` }} className="bg-purple-400" title="Shipping" />
                        <div style={{ width: `${(totalConfirmationCost / totalCost) * 100}%` }} className="bg-orange-400" title="Confirmation" />
                        <div style={{ width: `${(totalReturnCost / totalCost) * 100}%` }} className="bg-orange-200" title="Returns" />
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /> Ads</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400" /> Product</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400" /> Shipping</div>
                        {totalConfirmationCost > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400" /> Confirm</div>}
                        {totalReturnCost > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-200" /> Returns</div>}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    <CostItem
                        label="Ads (Lead Based)"
                        value={adCost}
                        icon={Target}
                        color={{ bg: 'bg-red-50', text: 'text-red-500' }}
                        percent={totalCost > 0 ? ((adCost / totalCost) * 100).toFixed(0) : 0}
                    />
                    <CostItem
                        label="Product (Unit Based)"
                        value={totalProductCost}
                        icon={Package}
                        color={{ bg: 'bg-blue-50', text: 'text-blue-500' }}
                        percent={totalCost > 0 ? ((totalProductCost / totalCost) * 100).toFixed(0) : 0}
                    />
                    <CostItem
                        label="Shipping (Order Based)"
                        value={totalShippingCost}
                        icon={Truck}
                        color={{ bg: 'bg-purple-50', text: 'text-purple-500' }}
                        percent={totalCost > 0 ? ((totalShippingCost / totalCost) * 100).toFixed(0) : 0}
                    />
                    {totalConfirmationCost > 0 && (
                        <CostItem
                            label="Confirmation (Delivered)"
                            value={totalConfirmationCost}
                            icon={CheckCircle}
                            color={{ bg: 'bg-orange-50', text: 'text-orange-600' }}
                            percent={totalCost > 0 ? ((totalConfirmationCost / totalCost) * 100).toFixed(0) : 0}
                        />
                    )}
                    {totalReturnCost > 0 && (
                        <CostItem
                            label="Returns"
                            value={totalReturnCost}
                            icon={RotateCcw}
                            color={{ bg: 'bg-orange-50', text: 'text-orange-300' }}
                            percent={totalCost > 0 ? ((totalReturnCost / totalCost) * 100).toFixed(0) : 0}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

import { RotateCcw } from "lucide-react";
