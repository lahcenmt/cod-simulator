
const STORAGE_KEY = 'codsim_history';

/**
 * Saves a simulation run to history
 * @param {Object} inputs - The input parameters
 * @param {Object} metrics - The calculated results
 * @param {string} name - Optional name/tag for this run
 * @param {string} note - Optional user note
 */
export const saveSimulation = (inputs, metrics, name = "Simulation Run", note = "") => {
    try {
        const historyItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            name,
            note,
            inputs,
            metrics: {
                // We store key metrics to avoid recalculating later vs old logic versions
                profit: metrics.profit,
                revenue: metrics.revenue,
                margin: metrics.margin,
                roi: metrics.roi,
                totalCost: metrics.totalCost,
                leads: inputs.leads,
                cpl: inputs.costPerLead,
                deliveredOrders: metrics.deliveredOrders,
                deliveryRate: inputs.deliveryRate,
                confirmationRate: inputs.confirmationRate
            }
        };

        const existing = getHistory();
        const updated = [historyItem, ...existing];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return historyItem;
    } catch (error) {
        console.error("Failed to save simulation:", error);
        return null;
    }
};

/**
 * Retrieves all history items
 */
export const getHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load history:", error);
        return [];
    }
};

/**
 * Deletes a specific history item
 */
export const deleteHistoryItem = (id) => {
    try {
        const existing = getHistory();
        const updated = existing.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    } catch (error) {
        console.error("Failed to delete item:", error);
        return [];
    }
};

/**
 * Clears all history
 */
export const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    return [];
};

/**
 * Generate insights from history
 */
export const generateHistoryInsights = (history) => {
    if (!history || history.length < 2) return [];

    const insights = [];
    // Sort by date ascending for trend analysis
    const sorted = [...history].sort((a, b) => a.timestamp - b.timestamp);
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    // Margin Trend
    const marginDiff = latest.metrics.margin - previous.metrics.margin;
    if (marginDiff > 5) {
        insights.push({
            type: 'positive',
            message: `Your profit margin improved by ${marginDiff.toFixed(1)}% compared to the previous run.`
        });
    } else if (marginDiff < -5) {
        insights.push({
            type: 'negative',
            message: `Your profit margin dropped by ${Math.abs(marginDiff).toFixed(1)}% compared to the previous run.`
        });
    }

    // Best Month (simplified to Best Run for now)
    const bestRun = sorted.reduce((max, curr) => curr.metrics.profit > max.metrics.profit ? curr : max, sorted[0]);
    if (bestRun.id === latest.id) {
        insights.push({
            type: 'success',
            message: "This is your most profitable simulation yet! Great job."
        });
    }

    return insights;
};
