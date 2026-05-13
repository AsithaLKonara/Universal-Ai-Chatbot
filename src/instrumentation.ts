import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'omnichat-saas',
    // Vercel OTEL handles the heavy lifting for OTLP export when configured via env vars
    // like OTLP_ENDPOINT and OTLP_HEADERS.
  });
}
