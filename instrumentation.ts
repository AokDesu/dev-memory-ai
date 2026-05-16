/**
 * Instrumentation for monitoring and error tracking
 * This file is automatically loaded by Next.js
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    const Sentry = await import('@sentry/nextjs');
    
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        
        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
        
        // Capture 100% of errors
        sampleRate: 1.0,
        
        // Set environment
        environment: process.env.NODE_ENV || 'development',

        // Integrations
        integrations: [
          Sentry.prismaIntegration(),
        ],
        
        // Filter out health check requests
        beforeSend(event, hint) {
          const url = event.request?.url;
          if (url && url.includes('/api/health')) {
            return null;
          }
          return event;
        },
        
        // Add custom tags
        initialScope: {
          tags: {
            service: 'developer-memory-ai',
          },
        },
      });
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    const Sentry = await import('@sentry/nextjs');
    
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
        environment: process.env.NODE_ENV || 'development',
      });
    }
  }
}
