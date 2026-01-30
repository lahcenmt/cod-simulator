import { Layers, MousePointer2, TrendingUp, Package, Truck, Globe, DollarSign, Plus, Trash2, ArrowRightLeft, RefreshCw, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { formatNumber } from "@/lib/formatting";

export default function InputForm({
    inputs,
    setInputs,
    market,
    setMarket,
    markets,
    metrics,
    // Scenario Management Props
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    addScenario
}) {
    // Input Modes: 'percent' or 'qty'
    const [inputModes, setInputModes] = useState({
        confirmation: 'percent',
        delivery: 'percent',
        offers: 'percent'
    });

    const toggleMode = (key) => {
        setInputModes(prev => ({
            ...prev,
            [key]: prev[key] === 'percent' ? 'qty' : 'percent'
        }));
    };

    const handleChange = (e) => {
        let { name, value } = e.target;
        if (value && typeof value === 'string') value = value.replace(',', '.');
        if (value === '' || value === '.') {
            setInputs((prev) => ({ ...prev, [name]: value }));
            return;
        }
        if (!isNaN(value) && Number(value) >= 0) {
            setInputs((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSliderChange = (name, value) => {
        setInputs((prev) => ({ ...prev, [name]: Number(value) }));
    };

    // --- Quantity Input Handlers ---
    const handleConfirmationQtyChange = (val) => {
        if (!val && val !== 0) return;
        const qty = Number(val);
        const leads = Number(inputs.leads) || 1;
        const newRate = (qty / leads) * 100;
        setInputs(prev => ({ ...prev, confirmationRate: Math.min(100, Math.max(0, newRate)) }));
    };

    const handleDeliveryQtyChange = (val) => {
        if (!val && val !== 0) return;
        const qty = Number(val);
        const confirmedOrders = metrics?.confirmedOrders || (Number(inputs.leads) * (Number(inputs.confirmationRate) / 100)) || 1;
        const newRate = (qty / confirmedOrders) * 100;
        setInputs(prev => ({ ...prev, deliveryRate: Math.min(100, Math.max(0, newRate)) }));
    };

    // --- Upsell & Quantity Logic ---
    const addUpsellTier = () => {
        setInputs(prev => {
            const lastQty = prev.upsellTiers?.length > 0 ? prev.upsellTiers[prev.upsellTiers.length - 1].qty : 1;
            const nextQty = lastQty + 1;
            return {
                ...prev,
                upsellTiers: [...(prev.upsellTiers || []), { qty: nextQty, price: prev.productPrice * (nextQty * 0.9) || 0, percent: 0, name: `Bundle ${nextQty}x` }]
            };
        });
    };

    const removeUpsellTier = (index) => {
        setInputs(prev => ({
            ...prev,
            upsellTiers: prev.upsellTiers.filter((_, i) => i !== index)
        }));
    };

    const updateUpsellTier = (index, field, val) => {
        let value = val;
        // Handle numeric fields
        if ((field === 'percent' || field === 'price') && typeof value === 'string') {
            value = value.replace(',', '.');
            // Allow empty or partial decimal input
            if (value === '' || value === '.') {
                setInputs(prev => {
                    const newTiers = [...prev.upsellTiers];
                    newTiers[index] = { ...newTiers[index], [field]: value };
                    return { ...prev, upsellTiers: newTiers };
                });
                return;
            }
            // Prevent non-numeric or negative input for these fields
            if (isNaN(value) || Number(value) < 0) return;
        }

        setInputs(prev => {
            const newTiers = [...prev.upsellTiers];
            newTiers[index] = { ...newTiers[index], [field]: value };
            return { ...prev, upsellTiers: newTiers };
        });
    };

    // Note: calculate 'Upsell' orders for input display if needed, but for now we focus on styling.
    // Implementing a simplified 'getTierOrders' if needed for display
    const getTierOrders = (tierIndex) => {
        if (!metrics?.breakdown?.tiers) return 0;
        const tier = metrics.breakdown.tiers[tierIndex];
        return tier?.orderCount ? Math.round(tier.orderCount) : 0;
    };

    // Offer quantity input
    const handleOfferQtyChange = (index, val) => {
        const deliveredOrders = metrics?.deliveredOrders || 1;
        const qty = Number(val);
        const newPercent = (qty / deliveredOrders) * 100;
        updateUpsellTier(index, 'percent', newPercent.toFixed(1));
    };

    const handleStandardQtyChange = (val) => {
        // This is tricky because standard is remainder. 
        // We can't easily set standard qty without adjusting upsells.
        // For simplicity, we might just skipping implementing reverse-calc for standard qty input for now
        // or just implement a visual feedback that it's read-only in 'percent' mode.
    };

    const handleStandardPriceChange = (val) => {
        let value = val;
        if (value && typeof value === 'string') value = value.replace(',', '.');
        if (value === '' || value === '.') {
            setInputs(prev => ({ ...prev, productPrice: value }));
            return;
        }
        if (!isNaN(value) && Number(value) >= 0) {
            setInputs(prev => ({ ...prev, productPrice: value }));
        }
    };

    const totalPercent = inputs.upsellTiers?.reduce((sum, t) => sum + (Number(t.percent) || 0), 0) || 0;
    const remainderPercent = Math.max(0, 100 - totalPercent);
    const isOverLimit = totalPercent > 100;

    return (
        <div className="bg-white min-h-full">
            <div className="p-6 border-b border-gray-200">
                {/* Scenario Selector - Added per user request */}
                {scenarios && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Scenario</label>
                            <button
                                onClick={addScenario}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                            >
                                <Plus size={12} /> New
                            </button>
                        </div>
                        <div className="relative group">
                            <select
                                value={activeScenarioId}
                                onChange={(e) => setActiveScenarioId(e.target.value)}
                                className="w-full h-10 pl-3 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none appearance-none cursor-pointer transition-all hover:bg-white hover:border-gray-300"
                            >
                                {scenarios.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} {s.isBaseline ? '(Baseline)' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400 group-hover:text-indigo-500 transition-colors">
                                <Layers size={16} />
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Market Settings</h2>

                {/* Market Selector */}
                <div className="flex gap-2 mb-4">
                    {Object.entries(markets).map(([key, m]) => (
                        <button
                            key={key}
                            onClick={() => setMarket(key)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all flex items-center justify-center gap-2 ${market.id === key
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span>{m.flag}</span> {m.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="divide-y divide-gray-200">

                {/* SECTION 1: TRAFFIC */}
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                        <MousePointer2 size={16} />
                        <h3>TRAFFIC</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Total Leads</label>
                                <input
                                    type="text"
                                    name="leads"
                                    value={inputs.leads}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Cost Per Lead (CPL)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="costPerLead"
                                        value={inputs.costPerLead}
                                        onChange={handleChange}
                                        className="w-full h-10 pl-3 pr-8 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">{market.currency}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: PRODUCT ECONOMICS */}
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                        <Package size={16} />
                        <h3>PRODUCT ECONOMICS</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Selling Price ({market.currency})</label>
                            <input
                                type="text"
                                name="productPrice"
                                value={inputs.productPrice}
                                onChange={(e) => handleStandardPriceChange(e.target.value)}
                                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Product Cost ({market.currency})</label>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                    x {metrics?.totalUnits || 0} units
                                </span>
                            </div>
                            <input
                                type="text"
                                name="productCost"
                                value={inputs.productCost}
                                onChange={handleChange}
                                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 2B: LOGISTICS & OPERATIONS */}
                <div className="p-6 space-y-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                        <Truck size={16} />
                        <h3>LOGISTICS & OPERATIONS</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-gray-500 uppercase">Shipping Fee ({market.currency})</label>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                    x {metrics?.deliveredOrders || 0} orders
                                </span>
                            </div>
                            <input
                                type="text"
                                name="shippingCost"
                                value={inputs.shippingCost}
                                onChange={handleChange}
                                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase truncate">Confirm. Fee</label>
                                <input
                                    type="text"
                                    name="confirmationCost"
                                    value={inputs.confirmationCost || 0}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-bold text-gray-500 uppercase truncate">Return Fee</label>
                                    <span className="text-[10px] text-red-400 font-medium">
                                        {metrics?.returnedOrders || 0} Rts
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="returnFee"
                                    value={inputs.returnFee || 0}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Other Monthly Costs</label>
                            <input
                                type="text"
                                name="otherCosts"
                                value={inputs.otherCosts || 0}
                                onChange={handleChange}
                                placeholder="Software, Rent, etc."
                                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: CONVERSION */}
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                        <TrendingUp size={16} />
                        <h3>CONVERSION RATES</h3>
                    </div>

                    <div className="space-y-6">
                        {/* Confirmation Rate */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                <span>Confirmation Rate</span>
                                <div className="flex bg-gray-100 p-0.5 rounded-lg">
                                    <button
                                        onClick={() => setInputModes(prev => ({ ...prev, confirmation: 'percent' }))}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${inputModes.confirmation === 'percent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        %
                                    </button>
                                    <button
                                        onClick={() => setInputModes(prev => ({ ...prev, confirmation: 'qty' }))}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${inputModes.confirmation === 'qty' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        123
                                    </button>
                                </div>
                            </div>

                            {inputModes.confirmation === 'percent' ? (
                                <div className="space-y-2">
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                name="confirmationRate"
                                                value={inputs.confirmationRate}
                                                onChange={handleChange}
                                                className="text-2xl font-black text-gray-900 w-20 bg-transparent border-none focus:ring-0 p-0 m-0 outline-none"
                                                placeholder="0"
                                            />
                                            <span className="text-2xl font-black text-gray-900">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={inputs.confirmationRate}
                                        onChange={(e) => handleSliderChange('confirmationRate', e.target.value)}
                                        className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #4f46e5 ${inputs.confirmationRate}%, #e5e7eb ${inputs.confirmationRate}%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                        <span>Poor (0%)</span>
                                        <span>Excellent (100%)</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-900 mb-1 block">Confirmed Orders</label>
                                    <input
                                        type="number"
                                        value={Math.round(metrics?.confirmedOrders || 0)}
                                        onChange={(e) => handleConfirmationQtyChange(e.target.value)}
                                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Delivery Rate */}
                        <div>
                            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                <span>Delivery Rate</span>
                                <div className="flex bg-gray-100 p-0.5 rounded-lg">
                                    <button
                                        onClick={() => setInputModes(prev => ({ ...prev, delivery: 'percent' }))}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${inputModes.delivery === 'percent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        %
                                    </button>
                                    <button
                                        onClick={() => setInputModes(prev => ({ ...prev, delivery: 'qty' }))}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${inputModes.delivery === 'qty' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        123
                                    </button>
                                </div>
                            </div>

                            {inputModes.delivery === 'percent' ? (
                                <div className="space-y-2">
                                    <div className="flex items-end justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                name="deliveryRate"
                                                value={inputs.deliveryRate}
                                                onChange={handleChange}
                                                className="text-2xl font-black text-gray-900 w-20 bg-transparent border-none focus:ring-0 p-0 m-0 outline-none"
                                                placeholder="0"
                                            />
                                            <span className="text-2xl font-black text-gray-900">%</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={inputs.deliveryRate}
                                        onChange={(e) => handleSliderChange('deliveryRate', e.target.value)}
                                        className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #10b981 ${inputs.deliveryRate}%, #e5e7eb ${inputs.deliveryRate}%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                        <span>Poor (0%)</span>
                                        <span>Excellent (100%)</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <label className="text-xs font-bold text-gray-900 mb-1 block">Delivered Orders</label>
                                    <input
                                        type="number"
                                        value={Math.round(metrics?.deliveredOrders || 0)}
                                        onChange={(e) => handleDeliveryQtyChange(e.target.value)}
                                        className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION 4: OFFERS (Collapsed/Extra) */}
                <div className="p-6 space-y-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
                            <ShoppingBag size={16} />
                            <h3>OFFERS & UPSELLS</h3>
                        </div>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg scale-90 origin-right">
                            <button
                                onClick={() => toggleMode('offers')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${inputModes.offers === 'percent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                %
                            </button>
                            <button
                                onClick={() => toggleMode('offers')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${inputModes.offers === 'qty' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Qty
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                            <div className="col-span-4">Offer Name</div>
                            <div className="col-span-4 text-center">Distribution</div>
                            <div className="col-span-3 text-center">Price</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Standard Offer (1x) */}
                        <div className="grid grid-cols-12 gap-2 items-center p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                            <div className="col-span-4">
                                <span className="text-gray-700 font-bold text-xs truncate block" title="Standard (1x)">Standard (1x)</span>
                            </div>

                            <div className="col-span-4">
                                {inputModes.offers === 'percent' ? (
                                    <div className="relative">
                                        <input
                                            value={remainderPercent.toFixed(1)}
                                            readOnly
                                            className="w-full h-9 border border-gray-200 rounded-lg pr-7 pl-2 text-xs font-bold text-center bg-white text-gray-500 focus:outline-none"
                                            placeholder="%"
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">%</span>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={Math.round(metrics?.deliveredOrders * (remainderPercent / 100)) || 0}
                                            readOnly
                                            className="w-full h-9 border border-gray-200 rounded-lg pr-8 pl-2 text-xs font-bold text-center bg-white text-gray-500 focus:outline-none"
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">ord.</span>
                                    </div>
                                )}
                            </div>

                            <div className="col-span-3">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={inputs.productPrice}
                                        onChange={(e) => handleStandardPriceChange(e.target.value)}
                                        className="w-full h-9 border border-gray-200 rounded-lg pr-8 pl-2 text-xs font-bold text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">{market.currency}</span>
                                </div>
                            </div>

                            <div className="col-span-1"></div>
                        </div>

                        {/* Upsell Tiers */}
                        {inputs.upsellTiers?.map((tier, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 bg-white border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors">
                                <div className="col-span-4">
                                    <span className="text-gray-700 font-bold text-xs truncate block" title={tier.name}>{tier.name}</span>
                                </div>

                                <div className="col-span-4">
                                    {inputModes.offers === 'percent' ? (
                                        <div className="relative">
                                            <input
                                                value={tier.percent}
                                                onChange={(e) => updateUpsellTier(index, 'percent', e.target.value)}
                                                className="w-full h-9 border border-gray-200 rounded-lg pr-7 pl-2 text-xs font-bold text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                                placeholder="0"
                                            />
                                            <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">%</span>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={getTierOrders(index)}
                                                onChange={(e) => handleOfferQtyChange(index, e.target.value)}
                                                className="w-full h-9 border border-gray-200 rounded-lg pr-8 pl-2 text-xs font-bold text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            />
                                            <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">ord.</span>
                                        </div>
                                    )}
                                </div>

                                <div className="col-span-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={tier.price}
                                            onChange={(e) => updateUpsellTier(index, 'price', e.target.value)}
                                            className="w-full h-9 border border-gray-200 rounded-lg pr-8 pl-2 text-xs font-bold text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-2 top-2.5 text-[10px] text-gray-400 font-bold pointer-events-none">{market.currency}</span>
                                    </div>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <button onClick={() => removeUpsellTier(index)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button onClick={addUpsellTier} className="w-full py-3 border border-dashed border-indigo-200 bg-indigo-50/50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 flex items-center justify-center gap-2 hover:border-indigo-300 transition-all">
                            <Plus size={14} /> Add Bundle / Upsell
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
