import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("\n=== DATABASE DATA CHECK ===\n");

  // Check processes
  const processCount = await prisma.process.count();
  const processes = await prisma.process.findMany({ take: 5 });
  console.log(`✓ Processes: ${processCount} total`);
  if (processes.length > 0) {
    console.log(`  Sample: ${processes[0].name}`);
  }

  // Check impacts
  const impactCount = await prisma.impactAssessment.count();
  console.log(`✓ Impact Assessments: ${impactCount} total`);

  // Check recovery objectives
  const recoveryObjCount = await prisma.recoveryObjective.count();
  console.log(`✓ Recovery Objectives: ${recoveryObjCount} total`);

  // Check resources
  const resourceCount = await prisma.businessResource.count();
  const resources = await prisma.businessResource.findMany({ take: 3 });
  console.log(`✓ Business Resources: ${resourceCount} total`);
  if (resources.length > 0) {
    console.log(`  Samples: ${resources.map((r) => r.name).join(", ")}`);
  }

  // Check dependencies
  const depCount = await prisma.dependency.count();
  console.log(`✓ Dependencies: ${depCount} total`);

  // Check recovery options
  const recoveryOptCount = await prisma.recoveryOption.count();
  console.log(`✓ Recovery Options: ${recoveryOptCount} total`);

  // Check cost-benefit analyses
  const cbaCount = await prisma.costBenefitAnalysis.count();
  console.log(`✓ Cost-Benefit Analyses: ${cbaCount} total`);

  // Check risks
  const riskCount = await prisma.risk.count();
  console.log(`✓ Risks: ${riskCount} total`);

  // Check threats
  const threatCount = await prisma.threat.count();
  console.log(`✓ Threats: ${threatCount} total`);

  // Check documents
  const docCount = await prisma.document.count();
  console.log(`✓ Documents: ${docCount} total`);

  // Check BC People
  const bcPeopleCount = await prisma.bCPerson.count();
  console.log(`✓ BC People: ${bcPeopleCount} total`);

  // Check BC Roles
  const bcRoleCount = await prisma.bCRole.count();
  console.log(`✓ BC Roles: ${bcRoleCount} total`);

  // Check Incidents
  const incidentCount = await prisma.incident.count();
  console.log(`✓ Incidents: ${incidentCount} total`);

  console.log("\n=== END CHECK ===\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
