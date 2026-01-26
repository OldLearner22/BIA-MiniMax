import { Router } from "express";
import { prisma } from "./server/db";

console.log("Testing route imports...");

try {
  const { default: processesRoutes } =
    await import("./server/routes/processes");
  console.log("✓ processes route imported");
} catch (e) {
  console.error("✗ processes route error:", e.message);
}

try {
  const { default: impactsRoutes } = await import("./server/routes/impacts");
  console.log("✓ impacts route imported");
} catch (e) {
  console.error("✗ impacts route error:", e.message);
}

process.exit(0);
