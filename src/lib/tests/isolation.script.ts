import { prisma, projectContext } from "../prisma";
import { logger } from "../logger";

async function runIsolationTest() {
    logger.info("Starting Multi-Tenant Isolation Test...");

    const p1 = "project_1";
    const p2 = "project_2";

    try {
        // Ensure system user exists
        await prisma.user.upsert({
            where: { id: "system" },
            update: {},
            create: { id: "system", email: "system@test.com", password: "dummy" }
        });

        // Ensure dummy projects exist
        await prisma.project.upsert({
            where: { id: p1 },
            update: {},
            create: { id: p1, name: "Test Project 1", userId: "system" }
        });
        await prisma.project.upsert({
            where: { id: p2 },
            update: {},
            create: { id: p2, name: "Test Project 2", userId: "system" }
        });

        // 1. Create data for Project 1
        await projectContext.run({ projectId: p1 }, async () => {
            await prisma.customer.upsert({
                where: { projectId_phone: { projectId: p1, phone: "12345" } },
                update: { name: "Tenant 1 Customer" },
                create: { projectId: p1, phone: "12345", name: "Tenant 1 Customer" }
            });
            logger.info("✅ Created data for Project 1");
        });

        // 2. Attempt to READ Project 1 data from Project 2 context
        await projectContext.run({ projectId: p2 }, async () => {
            const customer = await prisma.customer.findFirst({
                where: { phone: "12345" }
            });

            if (customer) {
                logger.error("❌ ISOLATION BREACH: Project 2 saw Project 1's customer!");
            } else {
                logger.info("✅ ISOLATION VERIFIED: Project 2 cannot see Project 1's data.");
            }
        });

    } catch (err) {
        logger.error("Isolation test failed", err);
    }
}

runIsolationTest();
