const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const WC_WEBHOOK_SECRET = process.env.WC_WEBHOOK_SECRET || "wc_test_webhook_secret";

async function testWCWebhook() {
  console.log("🚀 Testing WooCommerce Webhook...");

  // 1. Seed a test Project & CheckoutSession
  const project = await prisma.project.upsert({
    where: { apiKey: 'test-wc-api-key' },
    update: {},
    create: {
      name: 'Test WC Project',
      apiKey: 'test-wc-api-key',
      wooCommerceEnabled: true,
      user: {
        connectOrCreate: {
            where: { email: 'test@acme.com' },
            create: {
                name: 'Test',
                email: 'test@acme.com',
                password: 'password',
                role: 'ADMIN',
                plan: 'ENTERPRISE'
            }
        }
      }
    }
  });

  await prisma.checkoutSession.deleteMany({
    where: { orderId: '99999' }
  });

  const session = await prisma.checkoutSession.create({
    data: {
      projectId: project.id,
      customerId: 'test-cust',
      cartId: 'test-cart',
      orderId: '99999',
      status: 'pending'
    }
  });

  console.log(`- Created pending CheckoutSession [id=${session.id}] with orderId: 99999`);

  // 2. Prepare mock WooCommerce payload
  const payload = {
    id: 99999,
    status: "completed",
    total: "49.99",
    meta_data: [
      { key: "_omnichat_idempotency_key", value: "test-idempotency-key" }
    ]
  };

  const bodyString = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", WC_WEBHOOK_SECRET)
                          .update(bodyString, "utf8")
                          .digest("base64");

  console.log(`- Firing webhook to local server with topic 'order.updated'...`);

  try {
    const response = await fetch('http://localhost:3000/api/webhooks/woocommerce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-wc-webhook-topic': 'order.updated',
        'x-wc-webhook-id': '123',
        'x-wc-delivery-id': 'del-123',
        'x-wc-webhook-signature': signature
      },
      body: bodyString
    });

    const status = response.status;
    const json = await response.json();
    console.log(`📡 Response [${status}]:`, json);

    // 3. Verify Database Change
    const updatedSession = await prisma.checkoutSession.findUnique({
      where: { id: session.id }
    });

    if (updatedSession.status === 'COMPLETED') {
      console.log(`\n✅ SUCCESS! Webhook successfully updated the CheckoutSession status to COMPLETED in the database.`);
    } else {
      console.log(`\n❌ FAILED. Expected 'COMPLETED', got '${updatedSession.status}'`);
    }

  } catch (err) {
    console.error("❌ Next.js Dev Server is not running or crashed.", err);
  } finally {
    await prisma.checkoutSession.delete({ where: { id: session.id }});
    await prisma.$disconnect();
  }
}

testWCWebhook();
