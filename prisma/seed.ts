import { PrismaClient, ProjectRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting Database Seeding...");

    const passwordHash = await bcrypt.hash("password123", 10);

    // 1. Create Core Users
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@universal.ai' },
        update: {},
        create: {
            email: 'admin@universal.ai',
            name: 'System Admin',
            password: passwordHash,
            role: 'ADMIN',
            plan: 'ENTERPRISE',
        },
    });

    const standardUser = await prisma.user.upsert({
        where: { email: 'founder@startup.com' },
        update: {},
        create: {
            email: 'founder@startup.com',
            name: 'Startup Founder',
            password: passwordHash,
            role: 'USER',
            plan: 'PRO',
        },
    });

    const enterpriseUser = await prisma.user.upsert({
        where: { email: 'john@acmecorp.com' },
        update: {},
        create: {
            email: 'john@acmecorp.com',
            name: 'John Doe',
            password: passwordHash,
            role: 'USER',
            plan: 'ENTERPRISE',
        },
    });

    console.log("✅ Users created.");

    // 2. Create Projects & Workspaces
    const startupProject = await prisma.project.create({
        data: {
            name: 'Startup E-commerce Bot',
            userId: standardUser.id,
            whatsappEnabled: true,
            wooCommerceEnabled: true,
            wooCommerceStoreUrl: 'https://startup-store.com',
            maxDiscount: 0.15,
        }
    });

    const enterpriseWorkspace = await prisma.project.create({
        data: {
            name: 'Acme Corp Internal AI',
            userId: adminUser.id,
            ssoDomain: 'acmecorp.com',
            ssoProvider: 'SAML',
            maxQuantity: 100,
            restrictedTools: ['override_price'],
        }
    });

    console.log("✅ Projects created.");

    // 3. Setup RBAC Project Memberships
    await prisma.projectMember.createMany({
        data: [
            { userId: standardUser.id, projectId: startupProject.id, role: ProjectRole.OWNER },
            { userId: adminUser.id, projectId: enterpriseWorkspace.id, role: ProjectRole.OWNER },
            { userId: enterpriseUser.id, projectId: enterpriseWorkspace.id, role: ProjectRole.EDITOR },
        ],
        skipDuplicates: true
    });

    console.log("✅ RBAC Memberships configured.");

    // 4. Create Dummy Customers & Carts
    const customer = await prisma.customer.create({
        data: {
            projectId: startupProject.id,
            phone: '+1234567890',
            name: 'Jane Smith',
            email: 'jane@example.com',
            city: 'New York'
        }
    });

    const cart = await prisma.cart.create({
        data: {
            projectId: startupProject.id,
            customerId: customer.id,
            status: 'active',
            subtotal: 150.00,
            items: {
                create: [
                    { productId: 101, name: 'Wireless Headphones', price: 150.00, quantity: 1 }
                ]
            }
        }
    });

    console.log("✅ E-commerce records seeded.");
    console.log("🎉 Database seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
