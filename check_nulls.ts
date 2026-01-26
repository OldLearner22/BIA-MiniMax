import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const records = await prisma.exerciseRecord.findMany();
  records.forEach((r) => {
    if (!r.scheduledDate || !r.createdAt || !r.updatedAt) {
      console.log(`Record ${r.id} has null fields:`, {
        scheduledDate: r.scheduledDate,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      });
    }
  });
  console.log(`Checked ${records.length} records.`);
}
main().finally(() => prisma.$disconnect());
