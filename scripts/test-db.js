import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("Environment loaded");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("Connecting to database...");
  try {
    // Create a dummy process
    const process = await prisma.process.create({
      data: {
        name: "Test Process Verification JS",
        owner: "System",
        department: "IT",
        description: "Verification record JS",
        criticality: "low",
        status: "draft",
      },
    });
    console.log(
      `✅ Successfully created process: ${process.name} (${process.id})`,
    );

    const count = await prisma.process.count();
    console.log(`✅ Current process count: ${count}`);

    // Clean up
    await prisma.process.delete({ where: { id: process.id } });
    console.log("✅ Successfully cleaned up test record");
  } catch (e) {
    console.error("❌ Database verification failed:", e);
    process.exit(1);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
