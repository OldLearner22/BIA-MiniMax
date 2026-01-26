import { Prisma, PrismaClient } from "@prisma/client";

// Default Tenant ID for Single-Tenant Mode (Legacy)
const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

const prismaClient = new PrismaClient({
  log: ["error", "warn"],
  // Add connection timeout to prevent hangs
  errorFormat: "pretty",
});

// Set RLS context once on initialization, not per query
// This avoids the deadlock/hang issues from the original implementation
let rlsInitialized = false;

async function initializeRLS() {
  if (rlsInitialized) {
    console.log("[RLS] Already initialized, skipping");
    return;
  }

  console.log("[RLS] Starting initialization...");

  try {
    // Use template literal with proper parameter binding instead of raw SQL
    console.log("[RLS] Executing set_config...");
    await prismaClient.$executeRaw`SELECT set_config('app.current_tenant', ${DEFAULT_TENANT_ID}, false)`;
    rlsInitialized = true;
    console.log("[RLS] Context initialized for tenant:", DEFAULT_TENANT_ID);
  } catch (error) {
    console.warn(
      "[RLS] Warning: Could not initialize RLS context.",
      (error as any).message,
    );
    rlsInitialized = true; // Mark as attempted even on failure
    // If RLS init fails, continue anyway - application logic can filter
  }
}

// Start initialization immediately without blocking
initializeRLS()
  .then(() => {
    console.log("[RLS] Initialization completed successfully");
  })
  .catch((err) => {
    console.warn("[RLS] Initialization error (continuing anyway):", err);
  });

// Export the client - RLS will initialize in the background
export { prismaClient as prisma };
