import { prisma } from "./prisma";

// ─── Conversation Memory ────────────────────────────────────────────────────────

export async function saveMessage(
    projectId: string,
    sessionId: string | null,
    userId: string,
    message: string,
    response: string
): Promise<void> {
    await prisma.conversation.create({
        data: {
            projectId,
            sessionId,
            userId,
            message,
            response,
        },
    });
}

export async function getHistory(
    projectId: string,
    sessionId: string | null,
    userId: string
): Promise<{ message: string; response: string }[]> {
    const data = await prisma.conversation.findMany({
        where: {
            projectId,
            OR: [
                { sessionId: sessionId || undefined },
                { userId }
            ]
        },
        select: { message: true, response: true },
        orderBy: { createdAt: "desc" },
        take: 8,
    });

    return data.reverse();
}

// ─── Customer Profile (Smart Memory) ─────────────────────────────────

export interface CustomerPreferences {
    preferredBrands: string[];
    sizes: Record<string, string>;
    colors: string[];
    budget: number | null;
    dislikedProducts: string[];
    shoppingFrequency: string;
}

export interface CustomerProfile {
    id: string;
    phone: string;
    name?: string | null;
    email?: string | null;
    lastOrderId?: string | null;
    preferences?: CustomerPreferences | any;
    createdAt?: Date;
}

// Retrieve a customer profile by WhatsApp phone number
export async function getCustomerProfile(projectId: string, phone: string): Promise<CustomerProfile | null> {
    const data = await prisma.customer.findUnique({
        where: {
            projectId_phone: {
                projectId,
                phone
            }
        }
    });

    return data as CustomerProfile;
}

// Create or update a customer record
export async function upsertCustomerProfile(
    projectId: string,
    phone: string,
    updates: Partial<Omit<CustomerProfile, "id" | "phone" | "createdAt">>
): Promise<void> {
    await prisma.customer.upsert({
        where: {
            projectId_phone: {
                projectId,
                phone
            }
        },
        create: {
            projectId,
            phone,
            ...updates
        },
        update: updates
    });
}

// Build a personalized greeting from profile data
export function buildCustomerContext(profile: CustomerProfile | null): string {
    if (!profile) return "";

    const parts: string[] = [];
    if (profile.name) parts.push(`Customer name: ${profile.name}`);
    if (profile.lastOrderId) parts.push(`Last order ID: #${profile.lastOrderId}`);
    if (profile.preferences && Object.keys(profile.preferences).length > 0) {
        parts.push(`Known preferences: ${JSON.stringify(profile.preferences)}`);
    }
    return parts.length > 0 ? `\nCustomer profile:\n${parts.join("\n")}` : "";
}
