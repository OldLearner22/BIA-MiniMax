import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedComplianceData() {
  console.log("Seeding compliance frameworks and requirements...");

  // Create ISO 22301:2019 Framework
  const iso22301 = await prisma.complianceFramework.upsert({
    where: { code: "iso22301" },
    update: {},
    create: {
      code: "iso22301",
      name: "ISO 22301:2019",
      description: "Business Continuity Management Systems - Requirements",
      version: "2019",
    },
  });

  // Create DORA Framework
  const dora = await prisma.complianceFramework.upsert({
    where: { code: "dora" },
    update: {},
    create: {
      code: "dora",
      name: "DORA",
      description: "Digital Operational Resilience Act",
      version: "2022/2554",
    },
  });

  // Create NIS2 Framework
  const nis2 = await prisma.complianceFramework.upsert({
    where: { code: "nis2" },
    update: {},
    create: {
      code: "nis2",
      name: "NIS2 Directive",
      description: "Network and Information Systems Directive",
      version: "2022/2555",
    },
  });

  // Create AI Act Framework
  const aiact = await prisma.complianceFramework.upsert({
    where: { code: "aiact" },
    update: {},
    create: {
      code: "aiact",
      name: "AI Act",
      description: "Cyber Resilience Act",
      version: "2024/2847",
    },
  });

  console.log("Frameworks created successfully");

  // Create ISO 22301 Requirements
  const iso22301Requirements = [
    {
      clause: "Clause 4",
      title: "Understanding the organization and its context",
      description:
        "The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcome(s) of its BCMS.",
      requiredDocument: "Business Context Statement",
      priority: "HIGH" as const,
    },
    {
      clause: "Clause 5.2",
      title: "Policy",
      description:
        "Top management shall establish a business continuity policy that is appropriate to the purpose of the organization.",
      requiredDocument: "BCMS Policy",
      priority: "CRITICAL" as const,
    },
    {
      clause: "Clause 8.2.2",
      title: "Business impact analysis",
      description:
        "The organization shall establish, implement and maintain a documented process for business impact analysis.",
      requiredDocument: "Business Impact Analysis Procedures",
      priority: "CRITICAL" as const,
    },
    {
      clause: "Clause 8.2.3",
      title: "Risk assessment",
      description:
        "The organization shall establish, implement and maintain a documented process for risk assessment.",
      requiredDocument: "Risk Assessment Procedures",
      priority: "CRITICAL" as const,
    },
    {
      clause: "Clause 8.3",
      title: "Business continuity strategies and solutions",
      description:
        "The organization shall determine appropriate business continuity strategies and solutions.",
      requiredDocument: "BC Strategy Document",
      priority: "HIGH" as const,
    },
    {
      clause: "Clause 8.4",
      title: "Business continuity procedures",
      description:
        "The organization shall establish, document, implement and maintain procedures to respond to disrupting incidents.",
      requiredDocument: "BC Procedures",
      priority: "CRITICAL" as const,
    },
    {
      clause: "Clause 8.5",
      title: "Exercise and testing",
      description:
        "The organization shall exercise and test its business continuity procedures to ensure they are consistent with its business continuity objectives.",
      requiredDocument: "Exercise and Testing Plan",
      priority: "HIGH" as const,
    },
  ];

  for (const req of iso22301Requirements) {
    await prisma.complianceRequirement.upsert({
      where: {
        frameworkId_clause: {
          frameworkId: iso22301.id,
          clause: req.clause,
        },
      },
      update: {},
      create: {
        frameworkId: iso22301.id,
        ...req,
      },
    });
  }

  // Create DORA Requirements
  const doraRequirements = [
    {
      clause: "Article 11",
      title: "ICT risk management framework",
      description:
        "Financial entities shall have in place an internal governance and control framework that ensures an effective and prudent management of ICT risk.",
      requiredDocument: "ICT Risk Management Framework",
      priority: "CRITICAL" as const,
    },
    {
      clause: "Article 15",
      title: "Digital operational resilience testing",
      description:
        "Financial entities shall establish, maintain and review a sound and comprehensive digital operational resilience testing programme.",
      requiredDocument: "Digital Resilience Testing Programme",
      priority: "HIGH" as const,
    },
    {
      clause: "Article 16",
      title: "Incident reporting",
      description:
        "Financial entities shall report major ICT-related incidents and significant cyber threats to the competent authority.",
      requiredDocument: "Incident Reporting Procedures",
      priority: "CRITICAL" as const,
    },
  ];

  for (const req of doraRequirements) {
    await prisma.complianceRequirement.upsert({
      where: {
        frameworkId_clause: {
          frameworkId: dora.id,
          clause: req.clause,
        },
      },
      update: {},
      create: {
        frameworkId: dora.id,
        ...req,
      },
    });
  }

  // Create NIS2 Requirements
  const nis2Requirements = [
    {
      clause: "Article 17",
      title: "Incident notification",
      description:
        "Essential and important entities shall notify the competent authority or the CSIRT of any incident having a significant impact.",
      requiredDocument: "Incident Notification Procedures",
      priority: "CRITICAL" as const,
    },
    {
      clause: "Article 21",
      title: "Cybersecurity risk management measures",
      description:
        "Entities shall take appropriate and proportionate technical, operational and organizational measures to manage cybersecurity risks.",
      requiredDocument: "Cybersecurity Risk Management Plan",
      priority: "HIGH" as const,
    },
  ];

  for (const req of nis2Requirements) {
    await prisma.complianceRequirement.upsert({
      where: {
        frameworkId_clause: {
          frameworkId: nis2.id,
          clause: req.clause,
        },
      },
      update: {},
      create: {
        frameworkId: nis2.id,
        ...req,
      },
    });
  }

  console.log("Compliance requirements seeded successfully");
}

seedComplianceData()
  .catch((e) => {
    console.error("Error seeding compliance data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
