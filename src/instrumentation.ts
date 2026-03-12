/**
 * Next.js runs this file exactly once when the server starts.
 * It's the official entry point for server-side initialization code.
 * We use it to:
 * 1. Run DB migrations — safely creates any new tables on startup
 * 2. Start the reconciliation background job
 *
 * The NEXT_RUNTIME check ensures this only runs in the Node.js server process.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { runMigrations } = await import("./app/api/database");
    const { startReconciliationJob } = await import("./lib/reconScheduledTask");

    runMigrations();
    startReconciliationJob();
  }
}
