import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const organizationId = "00000000-0000-0000-0000-000000000001";

async function main() {
  console.log("🌱 Seeding BC People & Roles...");

  // Create sample people
  const person1 = await prisma.bCPerson.create({
    data: {
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@company.com",
      phone: "555-0101",
      mobile: "555-0102",
      department: "Executive",
      job_title: "Chief Business Continuity Officer",
      location: "New York",
      employment_status: "active",
      organization_id: organizationId,
    },
  });

  const person2 = await prisma.bCPerson.create({
    data: {
      first_name: "Sarah",
      last_name: "Johnson",
      email: "sarah.johnson@company.com",
      phone: "555-0201",
      mobile: "555-0202",
      department: "Operations",
      job_title: "BC Manager",
      location: "New York",
      employment_status: "active",
      organization_id: organizationId,
    },
  });

  const person3 = await prisma.bCPerson.create({
    data: {
      first_name: "Michael",
      last_name: "Brown",
      email: "michael.brown@company.com",
      phone: "555-0301",
      mobile: "555-0302",
      department: "IT",
      job_title: "Systems Administrator",
      location: "Chicago",
      employment_status: "active",
      organization_id: organizationId,
    },
  });

  console.log(`✅ Created 3 people`);

  // Create sample roles
  const executiveRole = await prisma.bCRole.create({
    data: {
      name: "Chief Business Continuity Officer",
      description: "Overall responsibility for BC program",
      role_type: "executive",
      criticality_level: "critical",
      min_experience_years: 5,
      required_certifications: ["CBCP", "PMP"],
      key_responsibilities: [
        "Oversee all BC initiatives",
        "Report to Executive Leadership",
        "Ensure compliance with regulations",
      ],
      authority_level: "Level 1",
      escalation_authority: true,
      budget_authority_limit: 1000000,
      organization_id: organizationId,
    },
  });

  const managerRole = await prisma.bCRole.create({
    data: {
      name: "BC Manager",
      description: "Manages day-to-day BC operations",
      role_type: "operational",
      criticality_level: "high",
      min_experience_years: 3,
      required_certifications: ["CBCP"],
      key_responsibilities: [
        "Plan and coordinate BC exercises",
        "Maintain BC documentation",
        "Monitor team performance",
      ],
      authority_level: "Level 2",
      escalation_authority: false,
      budget_authority_limit: 100000,
      organization_id: organizationId,
    },
  });

  const itRole = await prisma.bCRole.create({
    data: {
      name: "IT Systems Administrator",
      description: "Manages IT infrastructure resilience",
      role_type: "operational",
      criticality_level: "high",
      min_experience_years: 2,
      required_certifications: ["CompTIA Security+"],
      key_responsibilities: [
        "Maintain backup systems",
        "Monitor network uptime",
        "Document IT recovery procedures",
      ],
      authority_level: "Level 3",
      escalation_authority: false,
      budget_authority_limit: 50000,
      organization_id: organizationId,
    },
  });

  console.log(`✅ Created 3 roles`);

  // Create contact methods
  await prisma.bCContactMethod.create({
    data: {
      person_id: person1.id,
      contact_type: "email",
      contact_value: "john.smith@company.com",
      priority_order: 1,
      is_primary: true,
      preferred_for_alerts: true,
    },
  });

  await prisma.bCContactMethod.create({
    data: {
      person_id: person1.id,
      contact_type: "mobile",
      contact_value: "555-0102",
      priority_order: 2,
      is_primary: false,
      is_24_7_available: true,
      preferred_for_alerts: true,
    },
  });

  await prisma.bCContactMethod.create({
    data: {
      person_id: person2.id,
      contact_type: "email",
      contact_value: "sarah.johnson@company.com",
      priority_order: 1,
      is_primary: true,
    },
  });

  console.log(`✅ Created contact methods`);

  // Create training records
  await prisma.bCTrainingRecord.create({
    data: {
      person_id: person1.id,
      training_type: "Certification",
      training_title: "Certified Business Continuity Professional (CBCP)",
      provider: "DRII",
      completion_date: new Date("2023-06-15"),
      expiry_date: new Date("2026-06-15"),
      certificate_number: "CBCP-2023-001",
      status: "completed",
      renewal_required: false,
    },
  });

  await prisma.bCTrainingRecord.create({
    data: {
      person_id: person2.id,
      training_type: "Certification",
      training_title: "Certified Business Continuity Professional (CBCP)",
      provider: "DRII",
      completion_date: new Date("2022-09-20"),
      expiry_date: new Date("2025-09-20"),
      certificate_number: "CBCP-2022-002",
      status: "completed",
      renewal_required: true,
      renewal_reminder_days: 30,
    },
  });

  await prisma.bCTrainingRecord.create({
    data: {
      person_id: person3.id,
      training_type: "Certification",
      training_title: "CompTIA Security+",
      provider: "CompTIA",
      completion_date: new Date("2024-01-10"),
      expiry_date: new Date("2027-01-10"),
      certificate_number: "SEC-2024-001",
      status: "completed",
      renewal_required: false,
    },
  });

  console.log(`✅ Created training records`);

  // Create competencies
  const leadershipeComp = await prisma.bCCompetency.create({
    data: {
      name: "Crisis Leadership",
      description: "Ability to lead effectively during crisis situations",
      competency_category: "leadership",
      required_for_roles: [executiveRole.id, managerRole.id],
      organization_id: organizationId,
    },
  });

  const technicalComp = await prisma.bCCompetency.create({
    data: {
      name: "Disaster Recovery Technology",
      description: "Knowledge of disaster recovery systems and tools",
      competency_category: "technical",
      required_for_roles: [itRole.id],
      organization_id: organizationId,
    },
  });

  const communicationComp = await prisma.bCCompetency.create({
    data: {
      name: "Crisis Communication",
      description: "Ability to communicate effectively during emergencies",
      competency_category: "communication",
      required_for_roles: [executiveRole.id, managerRole.id],
      organization_id: organizationId,
    },
  });

  console.log(`✅ Created competencies`);

  // Create person competencies
  await prisma.bCPersonCompetency.create({
    data: {
      person_id: person1.id,
      competency_id: leadershipeComp.id,
      proficiency_level: 5,
      assessment_method: "formal_test",
      assessment_date: new Date("2024-01-15"),
    },
  });

  await prisma.bCPersonCompetency.create({
    data: {
      person_id: person1.id,
      competency_id: communicationComp.id,
      proficiency_level: 5,
      assessment_method: "manager_assessment",
      assessment_date: new Date("2024-01-15"),
    },
  });

  await prisma.bCPersonCompetency.create({
    data: {
      person_id: person2.id,
      competency_id: leadershipeComp.id,
      proficiency_level: 4,
      assessment_method: "manager_assessment",
      assessment_date: new Date("2024-01-10"),
    },
  });

  await prisma.bCPersonCompetency.create({
    data: {
      person_id: person3.id,
      competency_id: technicalComp.id,
      proficiency_level: 4,
      assessment_method: "formal_test",
      assessment_date: new Date("2024-01-20"),
    },
  });

  console.log(`✅ Created person competencies`);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
