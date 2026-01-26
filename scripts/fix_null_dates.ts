import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for NULL date fields...");

  const nullScheduled = (await prisma.$queryRawUnsafe(
    `SELECT "id", "title", "scheduledDate", "createdAt", "updatedAt" FROM "ExerciseRecord" WHERE "scheduledDate" IS NULL;`,
  )) as Array<{
    id: string;
    title?: string;
    scheduledDate?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  }>;

  const nullDue = (await prisma.$queryRawUnsafe(
    `SELECT "id", "exerciseRecordId", "dueDate" FROM "FollowUpAction" WHERE "dueDate" IS NULL;`,
  )) as Array<{
    id: string;
    exerciseRecordId: string;
    dueDate?: string | null;
  }>;

  console.log(
    `ExerciseRecords with NULL scheduledDate: ${nullScheduled.length}`,
  );
  if (nullScheduled.length > 0)
    console.log(JSON.stringify(nullScheduled, null, 2));

  console.log(`FollowUpActions with NULL dueDate: ${nullDue.length}`);
  if (nullDue.length > 0) console.log(JSON.stringify(nullDue, null, 2));

  if (nullScheduled.length === 0 && nullDue.length === 0) {
    console.log("No NULL date fields detected. Nothing to do.");
    return;
  }

  // Backup: print affected rows (already printed). Proceeding with updates.
  console.log("Updating NULL scheduledDate: set to COALESCE(createdAt, now())");
  const upd1 = (await prisma.$queryRawUnsafe(
    `UPDATE "ExerciseRecord" SET "scheduledDate" = COALESCE("createdAt", NOW()) WHERE "scheduledDate" IS NULL RETURNING id;`,
  )) as Array<{ id: string }>;
  console.log(
    "Updated ExerciseRecord ids:",
    upd1.map((r) => r.id),
  );

  console.log(
    "Updating NULL follow-up dueDate: set to parent scheduledDate or now",
  );
  const upd2 = (await prisma.$queryRawUnsafe(
    `UPDATE "FollowUpAction" f SET "dueDate" = COALESCE((SELECT e."scheduledDate" FROM "ExerciseRecord" e WHERE e.id = f."exerciseRecordId"), NOW()) WHERE f."dueDate" IS NULL RETURNING id;`,
  )) as Array<{ id: string }>;
  console.log(
    "Updated FollowUpAction ids:",
    upd2.map((r) => r.id),
  );

  // Re-check
  const nullScheduled2 = (await prisma.$queryRawUnsafe(
    `SELECT id FROM "ExerciseRecord" WHERE "scheduledDate" IS NULL;`,
  )) as Array<{ id: string }>;
  const nullDue2 = (await prisma.$queryRawUnsafe(
    `SELECT id FROM "FollowUpAction" WHERE "dueDate" IS NULL;`,
  )) as Array<{ id: string }>;
  console.log(
    `Remaining ExerciseRecord with NULL scheduledDate: ${nullScheduled2.length}`,
  );
  console.log(`Remaining FollowUpAction with NULL dueDate: ${nullDue2.length}`);
}

main()
  .catch((e) => {
    console.error("Error during cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
