import { WCProduct } from "../woocommerce";

export interface ScoringWeights {
    relevance: number;
    personalization: number;
    conversionProbability: number;
    popularity: number;
    margin: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
    relevance: 0.35,
    personalization: 0.25,
    conversionProbability: 0.20,
    popularity: 0.10,
    margin: 0.10,
};

export interface ProductScored extends WCProduct {
    score: number;
    scoreDetails: {
        relevance: number;
        personalization: number;
        conversion: number;
        popularity: number;
        margin: number;
    };
    explanation?: string;
}

/**
 * Ranks products based on a multi-signal scoring system.
 * This is the core intelligence for product recommendations.
 */
export function rankProducts(
    products: WCProduct[],
    userPreferences: any, // To be typed properly later
    weights: ScoringWeights = DEFAULT_WEIGHTS
): ProductScored[] {
    return products.map(product => {
        // Mocking signals for now - in production these would come from analytics/DB
        const signals = {
            relevance: Math.random(), // In reality, semantic similarity
            personalization: calculatePersonalization(product, userPreferences),
            conversion: 0.7 + (Math.random() * 0.3), // Simulated conversion probability
            popularity: 0.5 + (Math.random() * 0.5), // Simulated popularity
            margin: 0.4 + (Math.random() * 0.6), // Simulated profit margin
        };

        const finalScore = 
            signals.relevance * weights.relevance +
            signals.personalization * weights.personalization +
            signals.conversion * weights.conversionProbability +
            signals.popularity * weights.popularity +
            signals.margin * weights.margin;

        return {
            ...product,
            score: finalScore,
            scoreDetails: signals,
            explanation: generateExplanation(product, signals, weights)
        };
    }).sort((a, b) => b.score - a.score);
}

function calculatePersonalization(product: WCProduct, preferences: any): number {
    if (!preferences) return 0.5;
    
    let score = 0.5;
    
    // Brand affinity
    if (preferences.preferredBrands?.some((b: string) => product.name.toLowerCase().includes(b.toLowerCase()))) {
        score += 0.3;
    }

    // Price range match
    const price = parseFloat(product.price);
    if (preferences.budget) {
        if (price <= preferences.budget) score += 0.2;
        else score -= 0.1;
    }

    return Math.min(Math.max(score, 0), 1);
}

function generateExplanation(product: WCProduct, signals: any, weights: ScoringWeights): string {
    if (signals.personalization > 0.7) {
        return `Recommended because it matches your preference for ${product.name.split(' ')[0]} products.`;
    }
    if (signals.popularity > 0.8) {
        return `Trending choice: This is currently one of our most popular items.`;
    }
    if (signals.relevance > 0.8) {
        return `Top match for your search criteria.`;
    }
    return `Great value option based on your interests.`;
}
