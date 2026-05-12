import { CustomerProfile } from "./memory";
import { Cart } from "./cart";

export interface PredictiveSignals {
    purchaseIntent: number; // 0 to 1
    abandonmentRisk: number; // 0 to 1
    recommendedAction: "ACCELERATE" | "RESCUE" | "NURTURE" | "NONE";
}

export function calculatePredictiveSignals(
    profile: CustomerProfile | null,
    cart: Cart | null,
    sessionDurationMs: number,
    frictionCount: number
): PredictiveSignals {
    let intent = 0.2;
    let risk = 0.1;

    if (cart && cart.items.length > 0) {
        intent += 0.3;
        if (cart.subtotal > 5000) intent += 0.2;
    }
    
    if (frictionCount > 1) risk += 0.3;
    
    let action: PredictiveSignals["recommendedAction"] = "NONE";
    
    if (intent > 0.7 && risk < 0.3) {
        action = "ACCELERATE";
    } else if (risk > 0.5) {
        action = "RESCUE";
    } else if (intent > 0.4) {
        action = "NURTURE";
    }

    return {
        purchaseIntent: Math.min(intent, 1),
        abandonmentRisk: Math.min(risk, 1),
        recommendedAction: action
    };
}
