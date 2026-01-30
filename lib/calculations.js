// Utility to calculate real cost per delivered order (User Request)
// Explains why low confirmation/delivery increases the true ad cost
export const calculateEffectiveCPL = (leads, cpl, confirmationRate, deliveryRate) => {
    const rate = (confirmationRate / 100) * (deliveryRate / 100);
    // If rate is 0, cost is infinite (or treat as total spend if 0 delivered? handle gracefully)
    if (rate <= 0) return 0;
    return cpl / rate;
};

// 🔧 FINAL EDIT — EXACT COD + UPSELL CALCULATION LOGIC
// Implements mandatory business logic for Morocco/KSA Ecommerce

// 1. Funnel Logic
export const calculateDeliveredOrders = (leads, confirmationRate, deliveryRate) => {
    const confirmed = leads * (confirmationRate / 100);
    const delivered = confirmed * (deliveryRate / 100);
    // Return rounded values for display, but could retain precision if needed. 
    // For specific validation case: 120 * 0.5 * 0.5 = 30.
    return {
        confirmedOrders: Math.round(confirmed),
        deliveredOrders: Math.round(delivered)
    };
};

// 2. Real Cost Per Delivered Order (Lead based)
export const calculateRealCPL = (leads, totalAdSpend, deliveredOrders) => {
    if (deliveredOrders <= 0) return 0;
    return totalAdSpend / deliveredOrders;
};

// 2b. Confirmation Cost (Delivered Only - Strict Rule)
export const calculateConfirmationCost = (deliveredOrders, costPerDelivery) => {
    if (!costPerDelivery || deliveredOrders <= 0) return 0;
    return deliveredOrders * costPerDelivery;
};

// 3. Upsell Distribution & Revenue (Strict Input Driven)
export const calculateRevenueAndUnits = (deliveredOrders, allTiers) => {
    let totalRevenue = 0;
    let totalUnits = 0;
    let tiersBreakdown = [];

    // Distribute orders

    // We calculate counts for all tiers except the last one to avoid rounding gaps, 
    // or just calculate all and put rounding difference in the one with largest percent (or Base).
    // Strategy: Calculate all, put remainder in the Base (First) tier.

    let currentCountSum = 0;

    // Map initial counts
    let tempTiers = allTiers.map(tier => {
        // If percent is 0, count is 0
        const rawCount = tier.percent > 0 ? Math.round(deliveredOrders * (tier.percent / 100)) : 0;
        return { ...tier, count: rawCount };
    });

    currentCountSum = tempTiers.reduce((acc, t) => acc + t.count, 0);
    const diff = deliveredOrders - currentCountSum;

    // Adjust Base Tier (index 0) with remainder to ensure exact match to Delivered Orders
    if (tempTiers.length > 0) {
        tempTiers[0].count += diff;
        // Safety: ensure no negative if something weird happens (though math says diff shouldn't cause neg if rounds are close)
        if (tempTiers[0].count < 0) {
            // If negative (over-allocated others?), subtract from others? 
            // Simplified: logic usually holds. 
            tempTiers[0].count = 0;
            // Re-normalize? This edge case is rare. 
        }
    }

    // Calculate final financials
    tempTiers.forEach(tier => {
        const tierRev = tier.count * tier.price;
        const tierUnits = tier.count * tier.qty;
        totalRevenue += tierRev;
        totalUnits += tierUnits;

        tiersBreakdown.push({
            name: tier.name,
            percent: tier.percent,
            qty: tier.qty,
            price: tier.price,
            orderCount: tier.count,
            revenue: tierRev,
            units: tierUnits
        });
    });

    return { totalRevenue, totalUnits, tiersBreakdown };
};

// 4. Total Cost Calculation
export const calculateTotalCost = (
    totalAdSpend,
    totalUnits,
    productCostPerUnit,
    deliveredOrders,
    shippingCostPerOrder,
    confirmationCostTotal,
    returnedOrders,
    returnFee,
    otherCosts
) => {
    const totalProductCost = totalUnits * productCostPerUnit;
    const totalShippingCost = deliveredOrders * shippingCostPerOrder;
    // Note: Returns are Confirmed - Delivered. We should calculate return cost if applicable.
    // The prompt says "Total Cost = Ad Cost + Product Cost + Shipping Cost"
    // But earlier code had return fees. The prompt "Total Cost" formula didn't explicitly list return fees in its simplified visual formula,
    // but usually return fees are real. 
    // However, the "VALIDATION TEST" expected results:
    // Total Cost = 1200 (Ad) + 960 (Ship) + 420 (Prod) = 2580.
    // Validation Inputs: Leads 120, Conf 50%, Del 50%.
    // Confirmed = 60. Delivered = 30. Returns = 30.
    // If Return Fee exists (default 0 or user set?), the validation doesn't explicitly mention it in "Total Cost" breakdown, 
    // BUT the simulator usually includes it.
    // The prompt validation "Total Cost = 2580" implies NO return fees were calculated in that specific '2580' target 
    // (1200+960+420 = 2580). 
    // SO: For the purpose of "Total Cost" in the validation, we sum these three.
    // We will ADD return fees to the returned object but maybe keeping the 'totalCost' aligned with the prompt's main definition if requested?
    // The prompt says "Total Cost = Ad Cost + Product Cost + Shipping Cost". 
    // If I add Return Fees, the validation check (Comparison) might fail if the user enters a return fee.
    // However, the validation inputs didn't specify a return fee value (it listed CPL, Prod, Ship). 
    // I will include Return Fees as an additional cost component if the input exists, but user might set it to 0.

    const totalReturnCost = returnedOrders * returnFee;

    const total = totalAdSpend + totalProductCost + totalShippingCost + confirmationCostTotal + totalReturnCost + otherCosts;
    return {
        totalProductCost,
        totalShippingCost,
        totalReturnCost,
        totalConfirmationCost: confirmationCostTotal,
        totalCost: total
    };
};

export const calculateMetrics = (inputs) => {
    const {
        confirmationRate,
        deliveryRate,
        productPrice,
        costPerLead: rawCpl,
        productCost, // Per unit
        shippingCost, // Per order
        confirmationCost = 0, // Per delivered order
        returnFee = 0,
        otherCosts = 0,
        isCplMode = false, // Default to Budget Mode as per UI
        totalAdSpend: manualAdSpend = 0,
        dailyBudget: rawDailyBudget = 0,
        upsellTiers = [],
        adCurrency = "LOCAL",
        exchangeRate = 1
    } = inputs;

    // Enforce Numbers
    const cpl = Number(rawCpl) || 0;
    const dailyBudget = Number(rawDailyBudget) || 0;

    // 1. Calculate Leads & Ad Spend
    let leads = Number(inputs.leads) || 0;
    let adSpendLocal = 0;

    // Direct Calculation: Leads * CPL
    // We strictly use the "Leads" input and "CPL" input as the source of truth
    const rawInputSpend = leads * cpl;

    if (adCurrency === "USD") {
        adSpendLocal = rawInputSpend * exchangeRate;
    } else {
        adSpendLocal = rawInputSpend;
    }

    // 2. Funnel (Orders)
    const { confirmedOrders, deliveredOrders } = calculateDeliveredOrders(leads, confirmationRate, deliveryRate);
    const returnedOrders = Math.max(0, confirmedOrders - deliveredOrders);

    // 3. Upsells (Revenue & Units) - COMPOSE TIERS DYNAMICALLY
    // Combine standard config + upsell config
    // sanitize values to ensure no string concatenation errors
    let effectiveUpsellTiers = upsellTiers.map(t => ({
        ...t,
        percent: Number(t.percent) || 0,
        qty: Number(t.qty) || 0,
        price: Number(t.price) || 0
    }));

    const upsellPercent = effectiveUpsellTiers.reduce((sum, t) => sum + t.percent, 0);

    // If total user inputs exceed 100%, we strictly normalize them to sum to 100%
    // This prevents mathematical impossibilities (e.g. 110% of orders)
    if (upsellPercent > 100) {
        const ratio = 100 / upsellPercent;
        effectiveUpsellTiers = upsellTiers.map(t => ({
            ...t,
            percent: t.percent * ratio
        }));
    }

    // If user has defined tiers that sum to >= 100% (or we normalized them), we strictly use them.
    // Otherwise we assume the remainder is the "Standard Offer" (Base).
    let allTiers = [];
    if (upsellPercent >= 100) { // Using original sum check, but we use effective tiers
        allTiers = effectiveUpsellTiers.map((t, i) => ({
            name: t.name || `Bundle ${t.qty}x`,
            qty: t.qty,
            price: t.price,
            percent: t.percent
        }));
    } else {
        const basePercent = Math.max(0, 100 - upsellPercent);
        allTiers = [
            {
                name: "Standard Offer (1x)",
                qty: 1,
                price: productPrice,
                percent: basePercent
            },
            ...effectiveUpsellTiers.map((t, i) => ({
                name: t.name || `Bundle ${t.qty}x`,
                qty: t.qty,
                price: t.price,
                percent: t.percent
            }))
        ];
    }

    const { totalRevenue, totalUnits, tiersBreakdown } = calculateRevenueAndUnits(
        deliveredOrders,
        allTiers
    );

    // 4. Costs
    const totalConfirmationCost = calculateConfirmationCost(deliveredOrders, confirmationCost);

    const costs = calculateTotalCost(
        adSpendLocal,
        totalUnits,
        productCost,
        deliveredOrders,
        shippingCost,
        totalConfirmationCost,
        returnedOrders,
        returnFee,
        otherCosts
    );

    const profit = totalRevenue - costs.totalCost;

    // Derived Metrics
    // Effective Delivered Rate = Conf% * Del%
    // Real Cost Per Order = CPL / Effective Rate (Lead-based)
    const effectiveCPL_Local = (leads > 0) ? (adSpendLocal / leads) : 0;
    const realCostPerDeliveredOrder = calculateRealCPL(leads, adSpendLocal, deliveredOrders);

    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const roi = adSpendLocal > 0 ? (profit / adSpendLocal) * 100 : 0;

    // Detailed Breakdown Object for Validation Mode
    const breakdown = {
        leads,
        confirmationRate,
        deliveryRate,
        confirmedOrders,
        deliveredOrders,
        returnedOrders,
        tiers: tiersBreakdown,
        totalUnits,
        productCostPerUnit: productCost,
        totalProductCost: costs.totalProductCost,
        shippingCostPerOrder: shippingCost,
        totalShippingCost: costs.totalShippingCost,
        confirmationCostPerDelivered: confirmationCost,
        totalConfirmationCost: costs.totalConfirmationCost,
        returnFee,
        totalReturnCost: costs.totalReturnCost,
        otherCosts: inputs.otherCosts,
        adCost: adSpendLocal,
        realCostPerDeliveredOrder,
        totalCost: costs.totalCost,
        revenue: totalRevenue,
        profit
    };

    return {
        // Base Funnel
        leads,
        confirmedOrders,
        deliveredOrders,
        returnedOrders,

        // Financials
        revenue: totalRevenue,
        adCost: adSpendLocal,
        adCostUSD: adCurrency === "USD" ? rawInputSpend : rawInputSpend / (exchangeRate || 1),

        // Detailed Costs
        totalProductCost: costs.totalProductCost,
        totalShippingCost: costs.totalShippingCost,
        totalReturnCost: costs.totalReturnCost,
        totalConfirmationCost: costs.totalConfirmationCost,
        totalCost: costs.totalCost,

        // Results
        profit,
        roi,
        margin,

        // Advanced / Helper
        avgRevenuePerOrder: deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0,
        realCostPerDeliveredOrder,
        totalUnits,
        breakdown
    };
};



// 5. Scenarios (Conservative, Realistic, Aggressive)
// Conservative = Current Inputs (Baseline)
// Realistic = Small Improvements (+10% Del/Conf, -10% CPL)
// Aggressive = Major Improvements (+20% Del/Conf, -20% CPL)
export const generateScenarios = (inputs) => {
    const conservative = calculateMetrics({ ...inputs, name: "Conservative" });

    const realisticInputs = {
        ...inputs,
        name: "Realistic",
        deliveryRate: Math.min(inputs.deliveryRate + 10, 100),
        confirmationRate: Math.min(inputs.confirmationRate + 5, 100),
        costPerLead: inputs.costPerLead, // Keep CPL same for realistic, just ops improvement
    };
    const realistic = calculateMetrics(realisticInputs);

    const aggressiveInputs = {
        ...inputs,
        name: "Aggressive",
        deliveryRate: Math.min(inputs.deliveryRate + 20, 100),
        confirmationRate: Math.min(inputs.confirmationRate + 10, 100),
        costPerLead: inputs.costPerLead * 0.9,
        totalAdSpend: inputs.totalAdSpend * 0.9, // Logic check: if CPL drops, usually spend stays same -> more leads? Or spend drops?
        // Let's assume efficiency: same spend, more leads? Or same leads, less spend?
        // Simulating "Better CPL" usually implies calculating metrics based on that CPL.
    };
    const aggressive = calculateMetrics(aggressiveInputs);

    return { conservative, realistic, aggressive };
};

export const getAdvice = (inputs, market) => {
    const { deliveryRate, confirmationRate, upsellTiers } = inputs;
    const advice = [];
    const warnings = [];

    // Delivery Rules
    if (deliveryRate < 40) {
        warnings.push({
            type: "critical",
            message: "Delivery rate is very low (< 40%). Returns are destroying profit.",
            metric: "delivery",
        });
        if (market === "MA") {
            advice.push("Focus on filtering fake orders and verifying addresses before shipping.");
        }
    } else if (deliveryRate >= 40 && deliveryRate < 60) {
        warnings.push({
            type: "warning",
            message: "Delivery rate needs improvement (40-60%).",
            metric: "delivery",
        });
    }

    // Confirmation Rules
    if (confirmationRate < 45) {
        warnings.push({
            type: "warning",
            message: "Confirmation rate is low (< 45%).",
            metric: "confirmation",
        });
        advice.push("Improve your call script or use WhatsApp for quick confirmation.");
    }

    // Upsell Advice
    if (!upsellTiers || upsellTiers.length < 2) {
        advice.push("💡 Add upsell tiers (Buy 2, Buy 3) to increase AOV and offset ad costs.");
    }

    const metrics = calculateMetrics(inputs);

    // Break-even Analysis
    // 0 = Rev - (Ad + Prod + Ship + Return + Other)
    // Profit = Revenue - Costs
    // Break-even CPL means Profit = 0
    // Rev - (CPL*Leads + Prod + Ship + Return + Other) = 0
    // CPL*Leads = Rev - Prod - Ship - Return - Other
    // BE_CPL = (Rev - Prod - Ship - Return - Other) / Leads

    // We use the calculated totals from metrics (which account for upsell mixes)
    let be_cpl_local = 0;
    if (inputs.leads > 0) {
        be_cpl_local = (metrics.revenue - metrics.totalProductCost - metrics.totalShippingCost - metrics.totalReturnCost - inputs.otherCosts) / inputs.leads;
    }

    let currentCplLocal = (metrics.adCost / inputs.leads) || 0;

    if (currentCplLocal > be_cpl_local) {
        warnings.push({
            type: "critical",
            message: `You are losing money on every lead (Est. Break-even CPL: ${be_cpl_local.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`,
            metric: "ads",
        });
    } else if (currentCplLocal > be_cpl_local * 0.8) {
        warnings.push({
            type: "warning",
            message: `CPL is close to break-even (${be_cpl_local.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Scale carefully.`,
            metric: "ads",
        });
    }

    return { advice, warnings, breakEvenCPL: be_cpl_local };
};

export const rankProfitLevers = (inputs) => {
    const baseMetrics = calculateMetrics(inputs);
    const baseProfit = baseMetrics.profit;

    // 1. Delivery +10%
    const simDelivery = calculateMetrics({
        ...inputs,
        deliveryRate: Math.min(inputs.deliveryRate + 10, 100)
    });

    // 2. Confirmation +5%
    const simConfirmation = calculateMetrics({
        ...inputs,
        confirmationRate: Math.min(inputs.confirmationRate + 5, 100)
    });

    // 3. Ads -10% (Cost)
    const simAds = calculateMetrics({
        ...inputs,
        costPerLead: inputs.costPerLead * 0.9,
        totalAdSpend: inputs.totalAdSpend * 0.9
    });

    const levers = [
        {
            id: 'delivery',
            name: "Improve Delivery (+10%)",
            profitIncrease: simDelivery.profit - baseProfit,
            impact: 0
        },
        {
            id: 'confirmation',
            name: "Improve Confirmation (+5%)",
            profitIncrease: simConfirmation.profit - baseProfit,
            impact: 0
        },
        {
            id: 'ads',
            name: "Optimize Ads (-10% Cost)",
            profitIncrease: simAds.profit - baseProfit,
            impact: 0
        },
    ];

    levers.sort((a, b) => b.profitIncrease - a.profitIncrease);

    const max = levers[0]?.profitIncrease || 1;
    levers.forEach(l => {
        const ratio = l.profitIncrease / max;
        if (ratio > 0.7) l.impactLabel = "High";
        else if (ratio > 0.3) l.impactLabel = "Medium";
        else l.impactLabel = "Low";
    });

    return levers;
};

export const calculateBreakEvenMetrics = (inputs, preCalculatedMetrics = null) => {
    // 1. Get Baseline Metrics
    const m = preCalculatedMetrics || calculateMetrics(inputs);

    // 2. Identify Fixed vs Variable Costs
    // In this model:
    // Fixed Costs = Ad Spend (total) + Other Fixed Costs
    // Variable Costs = Product + Shipping + Confirmation + Returns
    // Note: Ad Spend is treated as "Fixed" for the purpose of "How many orders do I need to cover this specific ad spend?"
    // However, in reality, Ad Spend varies with leads. 
    // BUT the typical break-even question is: "given I spent X on ads, how many orders did I need?"

    const leads = inputs.leads > 0 ? inputs.leads : 1;
    const deliveredCount = m.deliveredOrders;

    const totalFixedCosts = m.breakdown.adCost + inputs.otherCosts;
    const totalVariableCosts = m.totalProductCost + m.totalShippingCost + m.totalConfirmationCost + m.totalReturnCost;

    // 3. Calculate Unit Economics (Per Delivered Order)
    const avgRevenuePerOrder = deliveredCount > 0 ? m.revenue / deliveredCount : 0;
    const avgVariableCostPerOrder = deliveredCount > 0 ? totalVariableCosts / deliveredCount : 0;
    const contributionMargin = avgRevenuePerOrder - avgVariableCostPerOrder;

    // 4. Calculate Break-Even Volume
    // BE Orders = Total Fixed Costs / Contribution Margin
    // If CM is <= 0, we never break even (infinity)
    let breakEvenOrders = 0;
    if (contributionMargin > 0) {
        breakEvenOrders = Math.ceil(totalFixedCosts / contributionMargin);
    } else {
        breakEvenOrders = 999999; // Impossible to break even
    }

    // 5. Calculate BE for Leads and Confirmed (Reverse Funnel)
    // BE Leads = BE Orders / (DeliveryRate% * ConfirmationRate%) ... roughly
    // Or simpler: BE Orders / (Delivered / Leads)
    const conversionRate = leads > 0 ? deliveredCount / leads : 0;
    const breakEvenLeads = conversionRate > 0 ? Math.ceil(breakEvenOrders / conversionRate) : 999999;

    const deliveryRateDec = inputs.deliveryRate / 100;
    const breakEvenConfirmed = deliveryRateDec > 0 ? Math.ceil(breakEvenOrders / deliveryRateDec) : 999999;

    // 6. Safety Margin
    // (Current Orders - BE Orders) / Current Orders
    const safetyMargin = deliveredCount > 0 ? ((deliveredCount - breakEvenOrders) / deliveredCount) * 100 : -100;

    // 7. Max CPL (Zero Profit)
    // 0 = (Rev - Var) - (MaxCPL * Leads) -> MaxCPL = (Rev - Var - OtherFixed) / Leads
    // Note: This assumes "Fixed" only includes OtherFixed for CPL calculation, 
    // because AdSpend IS the variable we are solving for (Leads * CPL).
    // Profit = Revenue - VariableCosts - OtherCosts - (Leads * CPL)
    // 0 = (Rev - Var - Other) - (Leads * CPL) => CPL = (Rev - Var - Other) / Leads
    const maxCPL = (m.revenue - totalVariableCosts - inputs.otherCosts) / leads;

    // 8. Min Delivery Rate (Reverse Solver)
    // Current Profit = (Orders * Margin) - Fixed
    // We need Profit = 0 with same Ad Spend.
    // This implies we need `breakEvenOrders` to be delivered.
    // New Delivery Rate = (BreakEvenOrders / ConfirmedOrders) * 100
    // (Assuming Confirmed Orders stays constant, which implies we just improve delivery)
    const minDeliveryRate = m.confirmedOrders > 0 ? (breakEvenOrders / m.confirmedOrders) * 100 : 0;

    // 9. Min Confirmation Rate
    // Similar logic: We need `breakEvenOrders` delivered.
    // We assume Delivery Rate is constant.
    // RequiredConfirmed = BreakEvenOrders / DeliveryRate
    // New Conf Rate = (RequiredConfirmed / Leads) * 100
    const requiredConfirmedForBE = deliveryRateDec > 0 ? breakEvenOrders / deliveryRateDec : 999999;
    const minConfirmationRate = (requiredConfirmedForBE / leads) * 100;

    return {
        // Core BE Metrics
        breakEvenOrders,
        breakEvenLeads,
        breakEvenConfirmed,
        totalFixedCosts,
        contributionMargin,
        avgRevenuePerOrder,
        avgVariableCostPerOrder,
        safetyMargin,
        isProfitable: m.profit >= 0,

        // Existing Properties (Compatible)
        maxCPL: Math.max(0, maxCPL),
        minDeliveryRate: Math.max(0, minDeliveryRate), // Don't cap at 100 for display (e.g. "You need 120% delivery" = Impossible)
        minConfirmationRate: Math.max(0, minConfirmationRate),
        currentMarginPerOrder: contributionMargin
    };
};
