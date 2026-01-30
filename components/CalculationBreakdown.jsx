import { ChevronDown, ChevronUp, Calculator } from "lucide-react";
import { useState } from "react";
import { formatCurrency, formatNumber } from "@/lib/formatting";

export default function CalculationBreakdown({ metrics, currency }) {
    const [isOpen, setIsOpen] = useState(false);

    // metrics.breakdown exists now
    const b = metrics.breakdown;
    if (!b) return null;

    return (
        <div className="bg-slate-900 text-slate-300 rounded-2xl overflow-hidden shadow-lg border border-slate-700 font-mono text-sm mt-8">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Calculator size={18} className="text-emerald-400" />
                    <span className="font-bold text-slate-100">Validation Mode: Calculation Trace</span>
                </div>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {isOpen && (
                <div className="p-6 space-y-6">
                    {/* 1. Funnel */}
                    <div className="border-b border-slate-700 pb-4">
                        <h4 className="text-emerald-400 font-bold mb-2 uppercase text-xs">1. Funnel Logic</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                            <div className="flex justify-between">
                                <span>Leads (Input)</span>
                                <span className="text-white">{formatNumber(b.leads)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Confirmed ({b.confirmationRate}%)</span>
                                <span className="text-white">{formatNumber(b.confirmedOrders)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivered ({b.deliveryRate}%)</span>
                                <span className="text-white font-bold">{formatNumber(b.deliveredOrders)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Revenue (Tier Distribution) */}
                    <div className="border-b border-slate-700 pb-4">
                        <h4 className="text-emerald-400 font-bold mb-2 uppercase text-xs">2. Revenue Distribution (Delivered Only)</h4>
                        <div className="space-y-2">
                            <div className="grid grid-cols-5 text-xs text-slate-500 pb-1 border-b border-slate-800">
                                <span className="col-span-2">Tier</span>
                                <span className="text-right">Orders</span>
                                <span className="text-right">Price</span>
                                <span className="text-right">Rev</span>
                            </div>
                            {b.tiers.map((tier, i) => (
                                <div key={i} className="grid grid-cols-5 text-slate-300">
                                    <span className="col-span-2">{tier.name} ({tier.percent}%)</span>
                                    <span className="text-right">{formatNumber(tier.orderCount)}</span>
                                    <span className="text-right">{formatNumber(tier.price)}</span>
                                    <span className="text-right text-white">{formatCurrency(tier.revenue, '')}</span>
                                </div>
                            ))}
                            <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                                <span>Total Revenue</span>
                                <span className="text-emerald-400">{formatCurrency(b.revenue, currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Costs Detail */}
                    <div>
                        <h4 className="text-emerald-400 font-bold mb-2 uppercase text-xs">3. Cost Calculation</h4>

                        {/* Ads */}
                        <div className="mb-3 pl-3 border-l-2 border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Ads (Input Driven)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Leads × CPL</span>
                                <span>{formatCurrency(b.adCost, currency)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Real Cost / Delivered</span>
                                <span>{formatCurrency(b.realCostPerDeliveredOrder, currency)}</span>
                            </div>
                        </div>

                        {/* Product */}
                        <div className="mb-3 pl-3 border-l-2 border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Product (Units Sold)</span>
                            </div>
                            {b.tiers.map((tier, i) => (
                                <div key={i} className="flex justify-between text-xs text-slate-500">
                                    <span>{tier.name}: {tier.orderCount} orders × {tier.qty} qty</span>
                                    <span>{formatNumber(tier.units)} units</span>
                                </div>
                            ))}
                            <div className="flex justify-between mt-1 pt-1 border-t border-slate-800">
                                <span>Total Units ({formatNumber(b.totalUnits)}) × Cost ({formatNumber(b.productCostPerUnit)})</span>
                                <span>{formatCurrency(b.totalProductCost, currency)}</span>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="pl-3 border-l-2 border-slate-700 mb-3">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Shipping (Delivered Orders)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{formatNumber(b.deliveredOrders)} orders × {formatNumber(b.shippingCostPerOrder)}</span>
                                <span>{formatCurrency(b.totalShippingCost, currency)}</span>
                            </div>
                        </div>

                        {/* Confirmation */}
                        <div className="pl-3 border-l-2 border-slate-700">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">Confirmation (Delivered Only)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{formatNumber(b.deliveredOrders)} orders × {formatNumber(b.confirmationCostPerDelivered || 0)}</span>
                                <span>{formatCurrency(b.totalConfirmationCost || 0, currency)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Final */}
                    <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                        <div>
                            <span className="block text-xs text-slate-500">NET PROFIT</span>
                            <span className="text-xl font-bold text-white">{formatCurrency(b.profit, currency)}</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-slate-500">All logic driven by inputs.</span>
                            <span className="block text-xs text-slate-500">No static values.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
