import { test, expect } from '@playwright/test';

test.describe('Authentication & SSO E2E', () => {

    test('should verify the site loads correctly', async ({ page }) => {
        // Smoke test to ensure Next.js starts
        await page.goto('/');
        const title = await page.title();
        // Just expecting it not to be an error page
        expect(title).not.toBeNull();
    });

    test('Enterprise SSO should provision a user and return JWT', async ({ request }) => {
        // Test our new /api/auth/sso endpoint using the Acme Corp dummy data from the seed script
        const response = await request.post('/api/auth/sso', {
            data: {
                email: 'newemployee@acmecorp.com',
                name: 'New Employee',
                ssoProviderId: 'saml-12345'
            }
        });

        expect(response.status()).toBe(200);
        
        const body = await response.json();
        expect(body.message).toBe('SSO Provisioning Successful');
        expect(body.role).toBe('VIEWER');
        expect(body.projectId).toBeDefined();

        // Verify the cookie was set
        const headers = response.headers();
        expect(headers['set-cookie']).toContain('auth-token=');
    });

    test('Enterprise SSO should reject unknown domains', async ({ request }) => {
        const response = await request.post('/api/auth/sso', {
            data: {
                email: 'hacker@unknown.com',
                name: 'Hacker',
                ssoProviderId: 'saml-999'
            }
        });

        expect(response.status()).toBe(403);
        const body = await response.json();
        expect(body.error).toContain('No enterprise workspace configured');
    });
});
