// Utility to format numbers and currency consistently throughout the app

export const formatCurrency = (amount, currencyCode, decimals = 2) => {
    if (amount === undefined || amount === null) return "0";

    // Check if currency uses decimals (MAD usually can be 0 or 2, USD always 2)
    // The prompt requested configurable decimals. 
    // USD -> 2 decimals
    // MAD -> 0 or 2 decimals

    let fractionDigits = decimals;
    if (currencyCode === 'MAD' && decimals === 2) {
        // Just adhering to the "0 or 2" rule. 
        // If the number is an integer, we might prefer 0 for cleaner look in MAD?
        // Prompt says "MAD -> 0 or 2 decimals (configurable)". 
        // Let's stick to 2 by default unless it's an integer for cleaner UI, or just force 2 if that was the "configurable" intent passed down.
        // For now, let's strictly follow the input 'decimals' or default to standard.
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(amount);
};

export const formatNumber = (number, decimals = 0) => {
    if (number === undefined || number === null) return "0";
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(number);
};
