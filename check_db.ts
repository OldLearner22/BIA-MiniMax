import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const processes = await prisma.process.count();
  const resources = await prisma.businessResource.count();
  const dependencies = await prisma.dependency.count();
  const resourceDependencies = await prisma.resourceDependency.count();

  console.log("--- DB COUNTS ---");
  console.log(`Processes: ${processes}`);
  console.log(`Resources: ${resources}`);
  console.log(`Dependencies: ${dependencies}`);
  console.log(`ResourceDependencies: ${resourceDependencies}`);
  console.log("-----------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
