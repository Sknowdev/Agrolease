/**
 * GET /health - liveness check.
 *
 * Task 1's only real route. Returns 200 with a minimal JSON body -
 * intentionally no DB check here yet (Supabase connectivity isn't part
 * of Task 1's test checklist), just confirms the process is up.
 */
export default async function healthRoute(app) {
  app.get('/health', async () => {
    return { status: 'ok', service: 'agrolease-backend', timestamp: new Date().toISOString() };
  });
}
