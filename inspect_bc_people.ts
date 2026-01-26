import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectPeopleTable() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bc_people'
    `;
    console.log("Columns in bc_people:", JSON.stringify(columns, null, 2));
  } catch (error) {
    console.error("Error inspecting table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectPeopleTable();
