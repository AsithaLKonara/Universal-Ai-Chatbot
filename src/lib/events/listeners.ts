import { omniBus, OmniEvent } from "../events";
import { handleRecoveryTrigger } from "../sales/recovery";
// We'll import these later
// import { enrichProduct } from "../catalog/enrichment";

export function initializeBackgroundListeners() {
    console.log("[LISTENERS] Initializing background event listeners...");

    omniBus.on(OmniEvent.SESSION_HESITATION, async (payload) => {
        console.log(`[LISTENERS] Processing hesitation for session ${payload.sessionId}`);
        await handleRecoveryTrigger("hesitation", payload);
    });

    omniBus.on(OmniEvent.CART_ABANDONED_POTENTIAL, async (payload) => {
        console.log(`[LISTENERS] Processing potential cart abandonment for session ${payload.sessionId}`);
        await handleRecoveryTrigger("cart_abandonment", payload);
    });

    omniBus.on(OmniEvent.PRICE_SENSITIVITY_DETECTED, async (payload) => {
        console.log(`[LISTENERS] Processing price sensitivity for session ${payload.sessionId}`);
        await handleRecoveryTrigger("price_sensitivity", payload);
    });

    // Example of product enrichment trigger
    omniBus.on(OmniEvent.PRODUCT_VIEWED, async (payload) => {
        // If product metadata indicates it hasn't been enriched yet, we could trigger it here.
        // await enrichProduct(payload.productId);
    });
}
