import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetImpactCategories() {
  console.log("🗑️  Deleting existing impact categories...");

  const deleted = await prisma.impactCategory.deleteMany({
    where: { organizationId: "00000000-0000-0000-0000-000000000001" },
  });

  console.log(`✅ Deleted ${deleted.count} categories`);
}

resetImpactCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
