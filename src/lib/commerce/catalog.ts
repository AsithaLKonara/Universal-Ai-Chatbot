import { WCProduct, WooCommerceConfig } from "../woocommerce";

export interface ProductRelationship {
    productId: number;
    relatedId: number;
    type: "upsell" | "cross_sell" | "alternative" | "compatible";
    strength: number; // 0 to 1
}

/**
 * Handles semantic intelligence for the product catalog.
 * This includes finding accessories, competitors, and bundles.
 */
export async function getRelatedProducts(
    product: WCProduct,
    type: "upsell" | "cross_sell" | "alternative",
    config: WooCommerceConfig
): Promise<WCProduct[]> {
    // In a real implementation, this would query a product graph or 
    // WooCommerce's native related/upsell fields.
    // For now, we simulate intelligence by searching for products in the same category/name space.
    
    const query = product.name.split(' ')[0]; // Use first word as generic category
    // This is a placeholder for a more advanced semantic search
    return []; 
}

export function getUpsellSuggestions(cartItems: any[]): string[] {
    // Logic to suggest items based on cart contents
    // Example: Camera -> Suggest Memory Card, Battery
    const rules: Record<string, string[]> = {
        "camera": ["Memory Card", "Tripod", "Camera Bag"],
        "laptop": ["Mouse", "Laptop Sleeve", "HDMI Cable"],
        "shoes": ["Socks", "Shoe Cleaner"],
    };

    const suggestions: string[] = [];
    for (const item of cartItems) {
        for (const [key, items] of Object.entries(rules)) {
            if (item.name.toLowerCase().includes(key)) {
                suggestions.push(...items);
            }
        }
    }
    return [...new Set(suggestions)];
}
