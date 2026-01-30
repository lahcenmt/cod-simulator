export const MARKETS = {
    MA: {
        id: "MA",
        name: "Morocco",
        currency: "MAD",
        flag: "🇲🇦",
        defaults: {
            leads: 100,
            confirmationRate: 50,
            deliveryRate: 50,
            productPrice: 249,
            costPerLead: 25,
            productCost: 80,
            shippingCost: 35,
            confirmationCost: 0, // Per delivered order
            returnFee: 15, // Cost of return shipping
            otherCosts: 0,
            upsellTiers: [],
            adCurrency: "LOCAL",
            exchangeRate: 10,
        },
    },
    SA: {
        id: "SA",
        name: "Saudi Arabia",
        currency: "SAR",
        flag: "🇸🇦",
        defaults: {
            leads: 100,
            confirmationRate: 60,
            deliveryRate: 70,
            productPrice: 199, // SAR
            costPerLead: 30, // SAR
            productCost: 60,
            shippingCost: 25,
            confirmationCost: 0,
            returnFee: 20,
            otherCosts: 0,
            upsellTiers: [],
            adCurrency: "LOCAL",
            exchangeRate: 3.75, // USD to SAR approx
        },
    },
};
