
// Core calculations for Morocco COD Budget Planner

export const calculateCODBudget = (state) => {
    const {
        totalBudget,
        duration, // days
        productPrice,
        productCost,
        shippingCost,
        confirmationRate, // as 0.50
        deliveryRate, // as 0.45
        channelSplit, // { facebook: 60, tiktok: 40 }
        selectedCPL
    } = state;

    // 1. Channel Split
    const facebookBudget = totalBudget * (channelSplit.facebook / 100);
    const tiktokBudget = totalBudget * (channelSplit.tiktok / 100);

    // 2. Lead Gen
    // Avoid division by zero
    const cpl = selectedCPL > 0 ? selectedCPL : 30;
    const totalLeads = Math.floor(totalBudget / cpl);
    const facebookLeads = Math.floor(facebookBudget / cpl);
    const tiktokLeads = Math.floor(tiktokBudget / cpl);

    // 3. Funnel
    const confirmedOrders = Math.round(totalLeads * confirmationRate);
    const deliveredOrders = Math.round(confirmedOrders * deliveryRate);
    const returnedOrders = confirmedOrders - deliveredOrders;

    // 4. Financials
    const totalRevenue = deliveredOrders * productPrice;

    // Costs
    // Product Cost + Shipping only on delivered? 
    // Usually in COD: 
    // - Product Cost is deducted for delivered items.
    // - Shipping is paid for Confirmed items (delivered + returned). Often you pay shipping for returns too.
    // The user prompts says: "Total Costs = Total Budget + (DeliveredOrders * (ProductCost + ShippingCost))"
    // It simplifies return costs. I will stick to the user's formula for now unless "Return Fee" is explicit.
    // User formula: const totalCosts = totalBudget + (deliveredOrders * (productCost + shippingCost));

    const cogs = deliveredOrders * productCost;
    const shipping = deliveredOrders * shippingCost;
    const totalCosts = totalBudget + cogs + shipping;

    const netProfit = totalRevenue - totalCosts;
    const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : 0;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // 5. Per Channel Estimates (Proportional)
    // We assume CPL is roughly same for both for simplicity unless specified otherwise,
    // but usually TikTok might be cheaper CPL but lower quality. 
    // For this specific planner, we apply the global CPL to both to keep it simple as per "selectedCPL".

    // Facebook
    const fbConfirmed = Math.round(facebookLeads * confirmationRate);
    const fbDelivered = Math.round(fbConfirmed * deliveryRate);
    const fbRevenue = fbDelivered * productPrice;
    const fbCosts = facebookBudget + (fbDelivered * (productCost + shippingCost));
    const fbProfit = fbRevenue - fbCosts;

    // TikTok
    const ttConfirmed = Math.round(tiktokLeads * confirmationRate);
    const ttDelivered = Math.round(ttConfirmed * deliveryRate);
    const ttRevenue = ttDelivered * productPrice;
    const ttCosts = tiktokBudget + (ttDelivered * (productCost + shippingCost));
    const ttProfit = ttRevenue - ttCosts;

    return {
        totalLeads,
        confirmedOrders,
        deliveredOrders,
        returnedOrders,
        financials: {
            revenue: totalRevenue,
            costs: totalCosts,
            profit: netProfit,
            roi,
            margin: profitMargin
        },
        channels: {
            facebook: {
                budget: facebookBudget,
                leads: facebookLeads,
                delivered: fbDelivered,
                profit: fbProfit
            },
            tiktok: {
                budget: tiktokBudget,
                leads: tiktokLeads,
                delivered: ttDelivered,
                profit: ttProfit
            }
        }
    };
};

export const calculateScenarios = (state) => {
    // We vary Confirmation and Delivery rates
    const { confirmationRate, deliveryRate } = state;

    // Worst Case: -15% efficiency (absolute or relative? User prompt says "Best: 60%|55%", Expected: "50%|45%", Worst: "35%|30%")
    // So roughly +/- 10-15 percentage points.

    // Helper to calculate profit only
    const getProfit = (conf, del) => {
        const res = calculateCODBudget({ ...state, confirmationRate: conf, deliveryRate: del });
        return {
            profit: res.financials.profit,
            delivered: res.deliveredOrders,
            roi: res.financials.roi
        };
    };

    const best = getProfit(Math.min(1, confirmationRate + 0.10), Math.min(1, deliveryRate + 0.10));
    const expected = getProfit(confirmationRate, deliveryRate);
    const worst = getProfit(Math.max(0, confirmationRate - 0.15), Math.max(0, deliveryRate - 0.15));

    return { best, expected, worst };
};

export const calculateBreakEven = (state) => {
    const { totalBudget, productPrice, productCost, shippingCost, confirmationRate, deliveryRate } = state;

    const profitPerOrder = productPrice - productCost - shippingCost;

    // Break-even Orders = Total Ad Spend / Profit Per Order (Contribution Margin)
    // If Profit Per Order is negative, you can never break even.

    let minDeliveredOrders = 0;
    let maxCPL = 0;
    let isProfitableUnit = profitPerOrder > 0;

    if (isProfitableUnit) {
        minDeliveredOrders = Math.ceil(totalBudget / profitPerOrder);

        // Max CPL to break even
        // BE CPL = (Profit Per Order * Confirmation Rate * Delivery Rate)
        // Logic: 1 lead -> Conf% -> Del% -> 1 Sale ($Profit). 
        // So 1 lead value = $Profit * Conf * Del.
        // You can pay up to that value.
        maxCPL = profitPerOrder * confirmationRate * deliveryRate;
    }

    return {
        minDeliveredOrders,
        maxCPL,
        profitPerOrder,
        isProfitableUnit
    };
};
