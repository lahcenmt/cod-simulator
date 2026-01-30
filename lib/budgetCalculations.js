
export const calculateBudgetStrategies = (totalBudget, profitGoal, marketCpl = 30) => {
    // Assumptions for strategies
    const confirmRate = 0.50; // 50%
    const deliveryRate = 0.50; // 50%
    const productPrice = 249; // Default average
    const productCost = 80;   // Default average
    const shipCost = 35;      // Default average

    // 1. Conservative (Low Risk)
    // Low CPL target, but likely lower volume scaling
    const conservativeCPL = marketCpl * 0.7; // 30% lower than market avg
    const conservativeLeads = Math.floor(totalBudget / conservativeCPL);
    const conservativeConfirmed = Math.round(conservativeLeads * confirmRate);
    const conservativeDelivered = Math.round(conservativeConfirmed * deliveryRate);
    const conservativeRevenue = conservativeDelivered * productPrice;
    const conservativeCosts = totalBudget + (conservativeDelivered * (productCost + shipCost));
    const conservativeProfit = conservativeRevenue - conservativeCosts;

    // 2. Balanced (Medium Risk) - RECOMMENDED
    // Market average CPL
    const balancedCPL = marketCpl;
    const balancedLeads = Math.floor(totalBudget / balancedCPL);
    const balancedConfirmed = Math.round(balancedLeads * confirmRate);
    const balancedDelivered = Math.round(balancedConfirmed * deliveryRate);
    const balancedRevenue = balancedDelivered * productPrice;
    const balancedCosts = totalBudget + (balancedDelivered * (productCost + shipCost));
    const balancedProfit = balancedRevenue - balancedCosts;

    // 3. Aggressive (High Risk)
    // Higher CPL to push volume/speed, but risks efficiency
    // Paradox: Usually higher budget allows higher CPL bid for volume. 
    // Here we model it as paying more to get leads faster or from premium sources.
    const aggressiveCPL = marketCpl * 1.3; // 30% higher
    const aggressiveLeads = Math.floor(totalBudget / aggressiveCPL);
    // Maybe aggressive has slightly better confirmation/quality because higher CPL? Let's assume +10% quality
    const aggressiveConfirmRate = 0.55;
    const aggressiveConfirmed = Math.round(aggressiveLeads * aggressiveConfirmRate);
    const aggressiveDelivered = Math.round(aggressiveConfirmed * deliveryRate);
    const aggressiveRevenue = aggressiveDelivered * productPrice;
    const aggressiveCosts = totalBudget + (aggressiveDelivered * (productCost + shipCost));
    const aggressiveProfit = aggressiveRevenue - aggressiveCosts;

    return {
        conservative: {
            title: "Conservative Strategy",
            type: "conservative",
            cpl: conservativeCPL,
            leads: conservativeLeads,
            confirmed: conservativeConfirmed,
            delivered: conservativeDelivered,
            revenue: conservativeRevenue,
            profit: conservativeProfit,
            roi: (conservativeProfit / totalBudget) * 100,
            risk: "Low",
            successRate: 85,
            color: "emerald"
        },
        balanced: {
            title: "Balanced Strategy",
            type: "balanced",
            cpl: balancedCPL,
            leads: balancedLeads,
            confirmed: balancedConfirmed,
            delivered: balancedDelivered,
            revenue: balancedRevenue,
            profit: balancedProfit,
            roi: (balancedProfit / totalBudget) * 100,
            risk: "Medium",
            successRate: 70,
            color: "blue",
            isRecommended: true
        },
        aggressive: {
            title: "Aggressive Strategy",
            type: "aggressive",
            cpl: aggressiveCPL,
            leads: aggressiveLeads,
            confirmed: aggressiveConfirmed,
            delivered: aggressiveDelivered,
            revenue: aggressiveRevenue,
            profit: aggressiveProfit,
            roi: (aggressiveProfit / totalBudget) * 100,
            risk: "High",
            successRate: 55,
            color: "orange"
        }
    };
};
