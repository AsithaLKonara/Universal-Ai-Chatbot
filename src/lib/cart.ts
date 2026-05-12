import { prisma } from "./prisma";

export interface CartItem {
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Cart {
    id: string;
    customerId: string;
    items: CartItem[];
    subtotal: number;
}

export async function getCart(projectId: string, customerId: string): Promise<Cart> {
    const cart = await prisma.cart.findFirst({
        where: { projectId, customerId, status: "active" },
        include: { items: true },
    });

    if (!cart) {
        const newCart = await prisma.cart.create({
            data: { projectId, customerId, status: "active", subtotal: 0 },
            include: { items: true },
        });
        return { ...newCart, items: [] };
    }

    return cart as any;
}

export async function addToCart(projectId: string, customerId: string, item: CartItem): Promise<Cart> {
    const cart = await getCart(projectId, customerId);

    // Check if item exists
    const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.productId },
    });

    if (existing) {
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
            },
        });
    }

    // Recalculate subtotal
    const allItems = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    const subtotal = allItems.reduce((acc: number, i: any) => acc + i.price * i.quantity, 0);

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: { subtotal },
        include: { items: true },
    });

    return updatedCart as any;
}

export async function clearCart(projectId: string, customerId: string): Promise<void> {
    const cart = await getCart(projectId, customerId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { subtotal: 0 } });
}
