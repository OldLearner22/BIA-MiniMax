import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function inspectAssignmentsTable() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bc_role_assignments'
    `;
    console.log(
      "Columns in bc_role_assignments:",
      JSON.stringify(columns, null, 2),
    );
  } catch (error) {
    console.error("Error inspecting table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectAssignmentsTable();
