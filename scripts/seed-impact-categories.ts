import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_IMPACT_CATEGORIES = [
  {
    name: "Financial",
    description: "Direct and indirect financial losses",
    weight: 25, // Changed from 16 to 25
    color: "#EF4444",
    displayOrder: 0,
    timeBasedDefinitions: [
      { timelinePointId: "1h", description: "Negligible, <$1,000" },
      { timelinePointId: "4h", description: "Minor, $1,000-$10,000" },
      { timelinePointId: "8h", description: "Moderate, $10,000-$50,000" },
      { timelinePointId: "24h", description: "Significant, $50,000-$100,000" },
      { timelinePointId: "48h", description: "Major, $100,000-$500,000" },
      { timelinePointId: "1w", description: "Severe, $500,000-$1M" },
      { timelinePointId: "4w", description: "Catastrophic, >$1M" },
    ],
  },
  {
    name: "Operational",
    description: "Impact on business operations and service delivery",
    weight: 20, // Changed from 15 to 20
    color: "#F59E0B",
    displayOrder: 1,
    timeBasedDefinitions: [
      {
        timelinePointId: "1h",
        description: "Minimal disruption, workarounds available",
      },
      {
        timelinePointId: "4h",
        description: "Minor delays, reduced efficiency",
      },
      {
        timelinePointId: "8h",
        description: "Moderate delays, key functions affected",
      },
      {
        timelinePointId: "24h",
        description: "Significant delays, critical functions impacted",
      },
      {
        timelinePointId: "48h",
        description: "Major disruption, operations severely limited",
      },
      {
        timelinePointId: "1w",
        description: "Severe disruption, most operations halted",
      },
      { timelinePointId: "4w", description: "Complete operational shutdown" },
    ],
  },
  {
    name: "Reputational",
    description: "Damage to brand, trust, and stakeholder confidence",
    weight: 20,
    color: "#8B5CF6",
    displayOrder: 2,
    timeBasedDefinitions: [
      {
        timelinePointId: "1h",
        description: "Minimal impact, localized concern",
      },
      { timelinePointId: "4h", description: "Minor negative feedback" },
      { timelinePointId: "8h", description: "Moderate media attention" },
      { timelinePointId: "24h", description: "Significant media coverage" },
      {
        timelinePointId: "48h",
        description: "Major brand damage, widespread concern",
      },
      {
        timelinePointId: "1w",
        description: "Severe reputational harm, trust eroded",
      },
      {
        timelinePointId: "4w",
        description: "Catastrophic damage, long-term brand destruction",
      },
    ],
  },
  {
    name: "Legal/Compliance",
    description: "Regulatory violations, contractual breaches, legal exposure",
    weight: 15,
    color: "#3B82F6",
    displayOrder: 3,
    timeBasedDefinitions: [
      { timelinePointId: "1h", description: "No violations expected" },
      {
        timelinePointId: "4h",
        description: "Minor compliance breach, administrative warning",
      },
      {
        timelinePointId: "8h",
        description: "Moderate violation, regulatory notice",
      },
      {
        timelinePointId: "24h",
        description: "Significant breach, fines/penalties",
      },
      {
        timelinePointId: "48h",
        description: "Major violation, legal action possible",
      },
      {
        timelinePointId: "1w",
        description: "Severe breach, license suspension risk",
      },
      {
        timelinePointId: "4w",
        description: "Catastrophic, license revocation/criminal liability",
      },
    ],
  },
  {
    name: "Health & Safety",
    description: "Impact on employee, customer, or public health and safety",
    weight: 15, // Changed from 10 to 15
    color: "#10B981",
    displayOrder: 4,
    timeBasedDefinitions: [
      { timelinePointId: "1h", description: "No health/safety impact" },
      {
        timelinePointId: "4h",
        description: "Minor discomfort, no medical attention",
      },
      {
        timelinePointId: "8h",
        description: "Moderate impact, first aid required",
      },
      {
        timelinePointId: "24h",
        description: "Significant impact, medical treatment needed",
      },
      {
        timelinePointId: "48h",
        description: "Major injuries, hospitalization required",
      },
      {
        timelinePointId: "1w",
        description: "Severe injuries, long-term health effects",
      },
      { timelinePointId: "4w", description: "Catastrophic, loss of life" },
    ],
  },
  {
    name: "Environmental",
    description: "Environmental damage and regulatory compliance",
    weight: 5,
    color: "#14B8A6",
    displayOrder: 5,
    timeBasedDefinitions: [
      { timelinePointId: "1h", description: "No environmental impact" },
      {
        timelinePointId: "4h",
        description: "Minimal impact, contained locally",
      },
      {
        timelinePointId: "8h",
        description: "Moderate impact, localized pollution",
      },
      {
        timelinePointId: "24h",
        description: "Significant impact, environmental notice",
      },
      {
        timelinePointId: "48h",
        description: "Major impact, remediation required",
      },
      { timelinePointId: "1w", description: "Severe impact, ecosystem damage" },
      {
        timelinePointId: "4w",
        description: "Catastrophic, irreversible environmental harm",
      },
    ],
  },
];

async function seedImpactCategories() {
  const organizationId = "00000000-0000-0000-0000-000000000001";

  console.log("🌱 Seeding impact categories...");

  // Check if categories already exist
  const existingCategories = await prisma.impactCategory.findMany({
    where: { organizationId },
  });

  if (existingCategories.length > 0) {
    console.log(
      `✅ Impact categories already exist (${existingCategories.length} found)`,
    );
    return;
  }

  // Create categories
  for (const category of DEFAULT_IMPACT_CATEGORIES) {
    await prisma.impactCategory.create({
      data: {
        name: category.name,
        description: category.description,
        weight: category.weight,
        color: category.color,
        displayOrder: category.displayOrder,
        organizationId,
        timeBasedDefinitions: {
          create: category.timeBasedDefinitions.map((def) => ({
            timelinePointId: def.timelinePointId,
            description: def.description,
            organizationId,
          })),
        },
      },
    });
    console.log(`  ✓ Created category: ${category.name}`);
  }

  console.log("✅ Impact categories seeded successfully!");
}

seedImpactCategories()
  .catch((error) => {
    console.error("❌ Error seeding impact categories:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
