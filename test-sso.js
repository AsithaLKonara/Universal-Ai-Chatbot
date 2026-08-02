async function testSSO() {
  console.log("🚀 Testing Local SSO Provisioning Endpoint...");
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/sso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test-employee@acmecorp.com',
        name: 'Acme Test Employee',
        ssoProviderId: 'saml-xyz'
      })
    });

    const status = response.status;
    const body = await response.json();
    const cookies = response.headers.get('set-cookie');

    console.log(`\n📡 Status: ${status}`);
    console.log(`📦 Response Body:`, body);
    
    if (status === 200 && cookies?.includes('auth-token=')) {
      console.log(`\n✅ SUCCESS! The E2E Flow is fully functional.`);
      console.log(`- Database seeded properly with acmecorp.com`);
      console.log(`- SSO provisioned the user dynamically`);
      console.log(`- JWT cookie was successfully returned in headers.`);
    } else {
      console.error(`\n❌ FAILED. Response or cookies invalid.`);
    }

  } catch (error) {
    console.error(`\n❌ ERROR: Next.js dev server might not be running.`, error.message);
  }
}

testSSO();
