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
            name: 'Super Admin',
            password: passwordHash,
            role: 'ADMIN',
            plan: 'ENTERPRISE',
        },
    });

    const ownerUser = await prisma.user.upsert({
        where: { email: 'owner@startup.com' },
        update: {},
        create: {
            email: 'owner@startup.com',
            name: 'Tenant Owner',
            password: passwordHash,
            role: 'USER',
            plan: 'PRO',
        },
    });

    const agentUser = await prisma.user.upsert({
        where: { email: 'agent@startup.com' },
        update: {},
        create: {
            email: 'agent@startup.com',
            name: 'Support Agent',
            password: passwordHash,
            role: 'USER',
            plan: 'PRO',
        },
    });

    const viewerUser = await prisma.user.upsert({
        where: { email: 'viewer@startup.com' },
        update: {},
        create: {
            email: 'viewer@startup.com',
            name: 'Data Viewer',
            password: passwordHash,
            role: 'USER',
            plan: 'PRO',
        },
    });

    console.log("✅ Users created.");

    // 2. Create Projects & Workspaces
    const startupProject = await prisma.project.create({
        data: {
            name: 'Startup E-commerce Bot',
            userId: ownerUser.id,
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
            { userId: ownerUser.id, projectId: startupProject.id, role: ProjectRole.OWNER },
            { userId: agentUser.id, projectId: startupProject.id, role: ProjectRole.EDITOR },
            { userId: viewerUser.id, projectId: startupProject.id, role: ProjectRole.VIEWER },
            { userId: adminUser.id, projectId: enterpriseWorkspace.id, role: ProjectRole.OWNER },
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
