
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/formatting';
import { Calendar, Trash2, ArrowUpRight, ArrowDownRight, Clock, Search, Filter, RotateCcw } from 'lucide-react';

export default function HistoryDashboard({ history, onDelete, onRestore, currency }) {
    const [filter, setFilter] = useState('all');

    // Sort history by date descending for list
    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => b.timestamp - a.timestamp);
    }, [history]);

    // Data for charts (ascending)
    const chartData = useMemo(() => {
        return [...history]
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(item => ({
                date: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                fullDate: new Date(item.timestamp).toLocaleString(),
                profit: item.metrics.profit,
                margin: item.metrics.margin,
                cpl: item.metrics.cpl,
                name: item.name
            }));
    }, [history]);

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                    <Clock size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No History Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Save your simulations to track your performance over time and see trends.
                </p>
            </div>
        );
    }

    const avgProfit = history.reduce((acc, curr) => acc + curr.metrics.profit, 0) / history.length;
    const bestProfit = Math.max(...history.map(h => h.metrics.profit));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Runs</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{history.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Avg Profit</span>
                    <p className="text-2xl font-black text-slate-800 mt-1">{formatCurrency(avgProfit, currency)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Best Result</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(bestProfit, currency)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase">Latest</span>
                    <p className="text-lg font-bold text-slate-700 mt-1 truncate">
                        {new Date(sortedHistory[0].timestamp).toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* 2. Trends Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <ArrowUpRight className="text-indigo-500" /> Profit Trend
                    </h3>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#94a3b8' }}
                                tickFormatter={(value) => `${value / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [formatCurrency(value, currency), 'Profit']}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorProfit)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. History List */}
            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 px-2">History Log</h3>
                {sortedHistory.map((item) => (
                    <div key={item.id} className="group bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                {new Date(item.timestamp).getDate()}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800">{item.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    <Clock size={12} />
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <span>•</span>
                                    <span>{item.metrics.leads} Leads</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs text-slate-400 font-medium uppercase">Profit</p>
                                <p className={`font-black ${item.metrics.profit > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                    {formatCurrency(item.metrics.profit, currency)}
                                </p>
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-slate-400 font-medium uppercase">Margin</p>
                                <p className="font-bold text-slate-700">{formatNumber(item.metrics.margin, 1)}%</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
                            <button
                                onClick={() => onRestore(item.inputs)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Restore this scenario"
                            >
                                <RotateCcw size={18} />
                            </button>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
