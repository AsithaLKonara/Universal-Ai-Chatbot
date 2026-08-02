import { z } from "zod";
import { 
    searchProducts, 
    getProduct, 
    getOrder, 
    formatOrderSummary, 
    normalizeWCProduct
} from "../../woocommerce";
import { addToCart, getCart } from "../../cart";
import { generateProductComparison } from "../../commerce/comparison";
import { trackActivity } from "../../sales/session";
import { ConversationContext } from "./types";

const ProductSearchSchema = z.object({
    product_query: z.string().min(2).max(100)
});

const OrderLookupSchema = z.object({
    order_id: z.string().regex(/^\d+$/)
});

const CartActionSchema = z.object({
    product_id: z.coerce.number().positive().optional(),
    quantity: z.coerce.number().int().min(1).max(10).optional(),
    product_query: z.string().optional()
});

export interface ToolResult {
    text: string;
    data?: any;
}

export class ToolExecutionEngine {
    public static async execute(
        intent: any, 
        message: string, 
        ctx: ConversationContext,
        userId: string
    ): Promise<ToolResult> {
        const { project } = ctx;
        const wcConfig = {
            storeUrl: project.wooCommerceStoreUrl || "",
            consumerKey: project.wooCommerceKey || "",
            consumerSecret: project.wooCommerceSecret || "",
        };

        try {
            switch (intent.intent) {
                case "product_search": {
                    const params = ProductSearchSchema.parse(intent.entities);
                    const products = await searchProducts(params.product_query, wcConfig);
                    if (!products.length) return { text: "No products found matching your query." };
                    
                    return {
                        text: `I found these items for you: ${products.map(p => p.name).join(", ")}`,
                        data: { 
                            type: "product_list", 
                            products: products.map(normalizeWCProduct) 
                        }
                    };
                }

                case "add_to_cart": {
                    const params = CartActionSchema.parse(intent.entities);
                    if (!params.product_id) return { text: "Which product would you like to add?" };
                    
                    const product = await getProduct(params.product_id, wcConfig);
                    if (!product) return { text: "I couldn't find that product." };

                    const cart = await addToCart(ctx.project.id, userId, {
                        productId: product.id,
                        name: product.name,
                        price: parseFloat(product.price),
                        quantity: params.quantity || 1,
                        image: product.images?.[0]?.src
                    });

                    return { 
                        text: `Added ${product.name} to your cart. You now have ${cart.items.length} items.`,
                        data: { cart }
                    };
                }

                case "view_cart": {
                    CartActionSchema.parse(intent.entities);
                    const cart = await getCart(project.id, userId);
                    if (!cart.items.length) return { text: "Your cart is empty." };
                    return {
                        text: `🛒 **Your Cart** Total: **${cart.subtotal.toFixed(2)}**.`,
                        data: { type: "cart_summary", cart }
                    };
                }

                case "order_status": {
                    const params = OrderLookupSchema.parse(intent.entities);
                    const order = await getOrder(params.order_id, wcConfig);
                    return {
                        text: order ? formatOrderSummary(order) : "Order not found.",
                        data: { order }
                    };
                }

                case "comparison_request": {
                    const params = CartActionSchema.parse(intent.entities);
                    const query = params.product_query ?? message;
                    const products = await searchProducts(query, wcConfig);
                    if (products.length < 2) return { text: "I need at least two products to compare." };
                    
                    const comparison = await generateProductComparison(products[0].id, products[1].id, wcConfig);
                    if (!comparison) return { text: "I couldn't generate a comparison at this time." };

                    trackActivity(userId, "compare", { productIds: [products[0].id, products[1].id] });

                    return {
                        text: `Here is a comparison between **${products[0].name}** and **${products[1].name}**:`,
                        data: { type: "product_comparison", comparison }
                    };
                }

                default:
                    return { text: "" };
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                console.warn("[TOOL] Contract validation failed", { error: (err as any).errors, intent: intent.intent });
                return { text: "I'm sorry, I couldn't process that because some information was missing or malformed. Could you try being more specific?" };
            }
            console.error("[TOOL] Execution failure", { error: err, intent: intent.intent });
            return { text: "I encountered a technical problem while trying to fetch that information." };
        }
    }
}
