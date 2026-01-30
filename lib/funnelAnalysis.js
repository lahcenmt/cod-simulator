
"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

// 1. Core Data Generation
export const generateFunnelData = () => {
    return {
        stages: [
            {
                name: 'Landing Page',
                key: 'landing',
                users: 10000,
                dropOff: 5800,
                dropOffRate: 58,
                timeSpent: '45s'
            },
            {
                name: 'Product View',
                key: 'product_view',
                users: 4200,
                dropOff: 3570,
                dropOffRate: 85,
                timeSpent: '2m 15s'
            },
            {
                name: 'Add to Cart',
                key: 'add_to_cart',
                users: 630,
                dropOff: 189,
                dropOffRate: 30,
                timeSpent: '1m 30s'
            },
            {
                name: 'Begin Checkout',
                key: 'checkout_start',
                users: 441,
                dropOff: 88,
                dropOffRate: 20,
                timeSpent: '3m 20s'
            },
            {
                name: 'Payment Info',
                key: 'payment_info',
                users: 353,
                dropOff: 177,
                dropOffRate: 50, // Critical
                timeSpent: '2m 45s'
            },
            {
                name: 'Confirmation',
                key: 'confirmation',
                users: 176,
                dropOff: 9,
                dropOffRate: 5,
                timeSpent: '5m 10s'
            },
            {
                name: 'Purchase Complete',
                key: 'purchase',
                users: 167,
                dropOff: 0,
                dropOffRate: 0,
                timeSpent: '30s'
            }
        ],
        totalConversionRate: 1.67,
        benchmarkConversionRate: 3.8,
        timeRange: 'Last 30 days'
    };
};

export const INDUSTRY_BENCHMARKS = {
    landing_to_product: 45,
    product_to_cart: 15,
    cart_to_checkout: 70,
    checkout_to_payment: 85,
    payment_to_confirmation: 90,
    confirmation_to_purchase: 95
};

// 2. AI Analysis Functions

export const analyzeFullFunnel = async (funnelData) => {
    if (!genAI) {
        console.warn("Gemini API Key missing");
        return getFallbackAnalysis(funnelData);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
        You are an expert e-commerce conversion rate optimization analyst.
        Analyze this funnel data and provide a concise JSON response.

        FUNNEL DATA:
        ${funnelData.stages.map((s, i) => `Stage ${i + 1}: ${s.name} - Users: ${s.users}, Drop-off: ${s.dropOff} (${s.dropOffRate}%)`).join('\n')}

        OVERALL: Conversion: ${funnelData.totalConversionRate}% (Benchmark: ${funnelData.benchmarkConversionRate}%)

        Return minimal valid JSON with this structure:
        {
            "summary": "Brief 2 sentence summary of performance.",
             "criticalIssues": [
                { "stage": "Stage Name", "severity": "Critical", "impact": "Why it matters" }
             ],
             "revenueImpact": { "potential": "Estimated monthly revenue increase if fixed", "uplift": "+XX%" }
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Gemini Error", e);
        return getFallbackAnalysis(funnelData);
    }
};

export const analyzeSpecificStage = async (stage, prev, next) => {
    if (!genAI) return getFallbackStageAnalysis(stage);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
        You are a UX expert. Analyze this specific funnel stage drop-off.
        
        STAGE: ${stage.name}
        Users In: ${prev ? prev.users : stage.users}
        Users Out: ${stage.users}
        Drop-off: ${stage.dropOff} (${stage.dropOffRate}%)
        
        Provide 3 specific recommendations to fix this drop-off.
        
        Return JSON:
        {
            "rootCauses": ["Possible cause 1", "Possible cause 2"],
            "recommendations": [
                {
                    "title": "Action Title",
                    "what": "What to do",
                    "why": "Why it helps",
                    "impact": "High/Medium",
                    "effort": "Low/High"
                }
            ]
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');
        return JSON.parse(jsonStr);
    } catch (e) {
        return getFallbackStageAnalysis(stage);
    }
};

// Fallbacks for when API is missing or fails
const getFallbackAnalysis = (data) => ({
    summary: "Your funnel shows significant leakage at the Product View and Payment Info stages. Fixing these could double your conversion rate.",
    criticalIssues: [
        { stage: "Product View", severity: "Critical", impact: "85% drop-off indicates poor product relevance or pricing." },
        { stage: "Payment Info", severity: "High", impact: "50% drop-off suggests friction in the payment gateway." }
    ],
    revenueImpact: { potential: "MAD 45,000", uplift: "+125%" },
    isFallback: true
});

const getFallbackStageAnalysis = (stage) => ({
    rootCauses: ["Technical friction", "Lack of trust signals", "Price shock"],
    recommendations: [
        { title: "Add Trust Badges", what: "Display security icons near CTA", why: "Reduces anxiety", impact: "Medium", effort: "Low" },
        { title: "Simplify Form", what: "Remove optional fields", why: "Reduces cognitive load", impact: "High", effort: "Medium" }
    ],
    isFallback: true
});
