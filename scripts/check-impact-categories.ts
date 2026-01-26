import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkImpactCategories() {
  console.log("\n🔍 Checking Impact Categories in Database...\n");

  const categories = await prisma.impactCategory.findMany({
    include: {
      timeBasedDefinitions: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  console.log(`Found ${categories.length} impact categories:\n`);

  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

  categories.forEach((cat) => {
    console.log(`📊 ${cat.name}`);
    console.log(`   Description: ${cat.description}`);
    console.log(`   Weight: ${cat.weight}%`);
    console.log(`   Color: ${cat.color}`);
    console.log(`   Display Order: ${cat.displayOrder}`);
    console.log(
      `   Time-based definitions: ${cat.timeBasedDefinitions.length}`,
    );
    console.log("");
  });

  console.log(
    `✅ Total Weight: ${totalWeight}% ${totalWeight === 100 ? "(Valid ✓)" : "(Invalid ✗)"}`,
  );
  console.log("");
}

checkImpactCategories()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
