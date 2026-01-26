import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Interface for timeline points (imported from types but defined here for seed context)
const PROCESSES = [
  {
    name: "Customer Support",
    department: "Customer Service",
    description: "Handling customer inquiries and support tickets",
  },
  {
    name: "Order Processing",
    department: "Operations",
    description: "Processing and fulfilling customer orders",
  },
  {
    name: "Payment Processing",
    department: "Finance",
    description: "Processing payments and financial transactions",
  },
  {
    name: "Data Analytics",
    department: "IT",
    description: "Analyzing business data and generating reports",
  },
  {
    name: "Email Communication",
    department: "Communications",
    description: "Sending and receiving business emails",
  },
  {
    name: "Inventory Management",
    department: "Operations",
    description: "Managing product inventory and stock levels",
  },
  {
    name: "Human Resources",
    department: "Administration",
    description: "Managing employee records and HR functions",
  },
  {
    name: "Cloud Infrastructure",
    department: "IT",
    description: "Managing cloud-based systems and services",
  },
  {
    name: "Website & Portal",
    department: "IT",
    description: "Operating the main website and customer portal",
  },
  {
    name: "Financial Reporting",
    department: "Finance",
    description: "Preparing financial reports and compliance documents",
  },
  {
    name: "Production Manufacturing",
    department: "Operations",
    description: "Manufacturing and quality control processes",
  },
  {
    name: "Legal & Compliance",
    department: "Legal",
    description: "Managing legal compliance and regulatory requirements",
  },
];

interface TimelinePoint {
  timeOffset: number; // hours from disruption
  timeLabel: string;
  financial: number;
  operational: number;
  reputational: number;
  legal: number;
  health: number;
  environmental: number;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Step 1: Clear existing data (optional - comment out to preserve)
    console.log("📋 Clearing existing data...");
    await prisma.impactAssessment.deleteMany({});
    await prisma.recoveryObjective.deleteMany({});
    await prisma.businessResource.deleteMany({});
    await prisma.recoveryOption.deleteMany({});
    await prisma.costBenefitAnalysis.deleteMany({});
    await prisma.strategyApproval.deleteMany({});
    await prisma.risk.deleteMany({});
    await prisma.threat.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.process.deleteMany({});
    console.log("✓ Data cleared\n");

    // Step 2: Create processes
    console.log("📝 Creating business processes...");
    const createdProcesses: any[] = [];
    const criticalities: ("critical" | "high" | "medium" | "low")[] = [
      "critical",
      "critical",
      "critical",
      "high",
      "high",
      "high",
      "medium",
      "critical",
      "critical",
      "medium",
      "high",
      "medium",
    ];

    for (let idx = 0; idx < PROCESSES.length; idx++) {
      const proc = PROCESSES[idx];
      const created = await prisma.process.create({
        data: {
          name: proc.name,
          department: proc.department,
          description: proc.description,
          criticality: criticalities[idx],
          owner: "Operations Manager",
          status: "approved",
        },
      });
      createdProcesses.push(created);
    }
    console.log(`✓ Created ${createdProcesses.length} processes\n`);

    // Step 3: Create Impact Assessments
    console.log("📊 Creating impact assessments...");
    const impacts: any[] = [];
    for (const process of createdProcesses) {
      const impact = await prisma.impactAssessment.create({
        data: {
          processId: process.id,
          financial: Math.floor(Math.random() * 80) + 20,
          operational: Math.floor(Math.random() * 80) + 20,
          reputational: Math.floor(Math.random() * 60) + 10,
          legal: Math.floor(Math.random() * 50) + 5,
          health: Math.floor(Math.random() * 40),
          environmental: Math.floor(Math.random() * 30),
        },
      });
      impacts.push(impact);
    }
    console.log(`✓ Created ${impacts.length} impact assessments\n`);

    // Step 4: Create Business Resources
    console.log("👥 Creating business resources...");
    const resources: any[] = [];
    const resourceTypes: (
      | "personnel"
      | "systems"
      | "equipment"
      | "facilities"
      | "vendors"
      | "data"
    )[] = [
      "personnel",
      "personnel",
      "personnel",
      "facilities",
      "facilities",
      "facilities",
      "systems",
      "systems",
      "systems",
      "data",
      "data",
      "data",
    ];

    const resourceNames = [
      "System Administrator",
      "Database Administrator",
      "Network Engineer",
      "Primary Data Center",
      "Secondary Data Center",
      "Backup Facility",
      "ERP System",
      "Database Cluster",
      "Email Server",
      "Customer Database",
      "Financial Records",
      "Source Code Repository",
    ];

    const redundancyLevels: ("none" | "partial" | "full")[] = [
      "none",
      "partial",
      "full",
    ];

    for (let i = 0; i < resourceNames.length; i++) {
      const resource = await prisma.businessResource.create({
        data: {
          name: resourceNames[i],
          type: resourceTypes[i],
          description: `Critical resource: ${resourceNames[i]}`,
          rtoValue: Math.floor(Math.random() * 8) + 1,
          rtoUnit: "hours",
          redundancy:
            redundancyLevels[
              Math.floor(Math.random() * redundancyLevels.length)
            ],
        },
      });
      resources.push(resource);
    }
    console.log(`✓ Created ${resources.length} business resources\n`);

    // Step 5: Create Recovery Options
    console.log("🔄 Creating recovery options...");
    const recoveryOptions: any[] = [];
    const strategyTypes: ("prevention" | "response" | "recovery")[] = [
      "prevention",
      "response",
      "recovery",
    ];
    const tiers: ("immediate" | "rapid" | "standard" | "extended")[] = [
      "immediate",
      "rapid",
      "standard",
      "extended",
    ];
    const technologies: (
      | "cloud"
      | "on-premise"
      | "hybrid"
      | "manual"
      | "external"
    )[] = ["cloud", "on-premise", "hybrid", "manual", "external"];
    const facilities: (
      | "primary"
      | "secondary"
      | "remote"
      | "external"
      | "none"
    )[] = ["primary", "secondary", "remote", "external", "none"];

    for (const process of createdProcesses) {
      // Create 2-3 recovery options per process
      const numOptions = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numOptions; i++) {
        const option = await prisma.recoveryOption.create({
          data: {
            processId: process.id,
            title: `${strategyTypes[i]} Strategy for ${process.name}`,
            description: `${strategyTypes[i].charAt(0).toUpperCase() + strategyTypes[i].slice(1)} recovery strategy`,
            strategyType: strategyTypes[i],
            tier: tiers[Math.floor(Math.random() * tiers.length)],
            rtoValue: Math.floor(Math.random() * 24) + 1,
            rtoUnit: "hours",
            rpoValue: Math.floor(Math.random() * 12) + 0.5,
            rpoUnit: "hours",
            recoveryCapacity: Math.floor(Math.random() * 40) + 60,
            peopleRequired: Math.floor(Math.random() * 10) + 2,
            technologyType:
              technologies[Math.floor(Math.random() * technologies.length)],
            facilityType:
              facilities[Math.floor(Math.random() * facilities.length)],
            implementationCost: Math.floor(Math.random() * 500000) + 50000,
            operationalCost: Math.floor(Math.random() * 100000) + 10000,
            readinessScore: Math.floor(Math.random() * 60) + 40,
            testingStatus: "not_tested",
            status: "draft",
            createdBy: "Planning Team",
          },
        });
        recoveryOptions.push(option);
      }
    }
    console.log(`✓ Created ${recoveryOptions.length} recovery options\n`);

    // Step 6: Create Cost-Benefit Analyses
    console.log("💰 Creating cost-benefit analyses...");
    const costBenefitAnalyses: any[] = [];
    for (const process of createdProcesses.slice(0, 8)) {
      const implementationCost = Math.floor(Math.random() * 1000000) + 100000;
      const operationalCost = Math.floor(Math.random() * 500000) + 50000;
      const maintenanceCost = Math.floor(Math.random() * 200000) + 20000;
      const totalCost = implementationCost + operationalCost + maintenanceCost;

      const avoidedFinancial = Math.floor(Math.random() * 5000000) + 500000;
      const avoidedOperational = Math.floor(Math.random() * 2000000) + 200000;
      const avoidedReputational = Math.floor(Math.random() * 1000000) + 100000;
      const avoidedLegal = Math.floor(Math.random() * 500000) + 50000;
      const totalBenefit =
        avoidedFinancial +
        avoidedOperational +
        avoidedReputational +
        avoidedLegal;

      const netBenefit = totalBenefit - totalCost;
      const roi = (netBenefit / totalCost) * 100;
      const bcRatio = totalBenefit / totalCost;

      const cba = await prisma.costBenefitAnalysis.create({
        data: {
          title: `CBA - ${process.name}`,
          description: `Cost-Benefit Analysis for ${process.name}`,
          analysisDate: new Date(),

          implementationPersonnel: implementationCost * 0.4,
          implementationTech: implementationCost * 0.35,
          implementationInfra: implementationCost * 0.25,
          implementationTraining: 0,
          implementationExternal: 0,
          implementationOther: 0,

          operationalPersonnel: operationalCost * 0.5,
          operationalTech: operationalCost * 0.3,
          operationalInfra: operationalCost * 0.2,
          operationalTraining: 0,
          operationalExternal: 0,
          operationalOther: 0,

          maintenancePersonnel: maintenanceCost * 0.4,
          maintenanceTech: maintenanceCost * 0.35,
          maintenanceInfra: maintenanceCost * 0.25,
          maintenanceTraining: 0,
          maintenanceExternal: 0,
          maintenanceOther: 0,

          avoidedFinancial,
          avoidedOperational,
          avoidedReputational,
          avoidedLegal,

          totalCost,
          totalBenefit,
          netBenefit,
          roi,
          bcRatio,
          paybackPeriod: totalCost / (totalBenefit / 12),

          bestCaseRoi: roi * 1.2,
          bestCaseNetBenefit: netBenefit * 1.2,
          worstCaseRoi: roi * 0.8,
          worstCaseNetBenefit: netBenefit * 0.8,

          intangibleBenefits: [
            "Improved customer trust",
            "Better team morale",
            "Reduced risk",
          ],
          recommendation: netBenefit > 0 ? "approve" : "reject",
          recommendationNotes:
            netBenefit > 0 ? "Strong financial case" : "Requires optimization",
          riskReduction: Math.floor(Math.random() * 40) + 20,

          status: "approved",
          createdBy: "Finance Team",
        },
      });
      costBenefitAnalyses.push(cba);
    }
    console.log(
      `✓ Created ${costBenefitAnalyses.length} cost-benefit analyses\n`,
    );

    // Step 7: Create Strategy Approvals
    console.log("✅ Creating strategy approvals...");
    const strategyApprovals: any[] = [];

    for (const cba of costBenefitAnalyses.slice(0, 5)) {
      const approval = await prisma.strategyApproval.create({
        data: {
          strategyType: "cost_benefit",
          strategyId: cba.id,
          strategyTitle: cba.title,
          status: "APPROVED",
          currentStep: 2,
          submittedBy: "Planning Manager",
          submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          submissionNotes: `Strategy approval for ${cba.title}`,
          finalDecision: "approved",
          finalDecisionDate: new Date(),
          finalDecisionBy: "Executive Director",
          finalDecisionNotes: "Approved for implementation",
          approvalConditions: [
            "Resource allocation confirmed",
            "Budget approved",
          ],
          auditLog: JSON.parse(
            JSON.stringify([
              {
                timestamp: new Date(
                  Date.now() - 7 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                action: "submitted",
                performedBy: "Planning Manager",
                details: "Strategy submitted for approval",
              },
            ]),
          ),
          steps: {
            create: [
              {
                stepNumber: 1,
                title: "Initial Review",
                description: "Technical feasibility review",
                status: "APPROVED",
                decision: "approve",
                decidedBy: "Technical Lead",
                decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                comments: "Technically feasible",
              },
              {
                stepNumber: 2,
                title: "Manager Approval",
                description: "Department manager sign-off",
                status: "APPROVED",
                decision: "approve",
                decidedBy: "Department Manager",
                decidedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                comments: "Approved for budget",
              },
              {
                stepNumber: 3,
                title: "Executive Sign-off",
                description: "Executive leadership approval",
                status: "APPROVED",
                decision: "approve",
                decidedBy: "Executive Director",
                decidedAt: new Date(),
                comments: "Approved for implementation",
              },
            ],
          },
        },
      });
      strategyApprovals.push(approval);
    }
    console.log(`✓ Created ${strategyApprovals.length} strategy approvals\n`);

    // Step 8: Create Risk data
    console.log("⚠️ Creating risks...");
    const risks: any[] = [];
    const riskCategories = [
      "Operational",
      "Technical",
      "Strategic",
      "Compliance",
      "Financial",
    ];
    for (let i = 0; i < 8; i++) {
      const probability = Math.floor(Math.random() * 3) + 1;
      const impact = Math.floor(Math.random() * 4) + 1;
      const exposure = probability * impact;
      const risk = await prisma.risk.create({
        data: {
          title: `Risk ${i + 1}: ${riskCategories[i % riskCategories.length]}`,
          description: `${riskCategories[i % riskCategories.length]} risk scenario`,
          category: riskCategories[i % riskCategories.length],
          probability,
          impact,
          exposure,
          criticality: exposure > 8 ? "high" : exposure > 4 ? "medium" : "low",
          status: "active",
          mitigationStrategy: "Implement risk controls and monitoring",
        },
      });
      risks.push(risk);
    }
    console.log(`✓ Created ${risks.length} risks\n`);

    // Step 9: Create Threat data
    console.log("🛡️ Creating threats...");
    const threats: any[] = [];
    const threatSources = [
      "External",
      "Internal",
      "Natural",
      "Human Error",
      "Malicious",
    ];
    for (let i = 0; i < 8; i++) {
      const likelihood = Math.floor(Math.random() * 3) + 1;
      const impact = Math.floor(Math.random() * 4) + 1;
      const riskScore = likelihood * impact;
      const threat = await prisma.threat.create({
        data: {
          title: `Threat ${i + 1}: ${threatSources[i % threatSources.length]}`,
          description: `Potential ${threatSources[i % threatSources.length].toLowerCase()} threat`,
          category: threatSources[i % threatSources.length],
          source: threatSources[i % threatSources.length],
          likelihood,
          impact,
          riskScore,
          status: "identified",
        },
      });
      threats.push(threat);
    }
    console.log(`✓ Created ${threats.length} threats\n`);

    // Step 10: Create Incidents
    console.log("🚨 Creating incidents...");
    const incidents: any[] = [];
    const incidentData = [
      {
        incidentNumber: "INC-2026-001",
        title: "Database Server Outage",
        description:
          "Primary database server experienced a hardware failure resulting in complete service unavailability",
        category: "TECHNICAL_FAILURE",
        severity: "CRITICAL",
        status: "RESOLVED",
        businessImpact: "Payment processing halted for 2 hours",
        estimatedFinancialImpact: 50000,
        affectedProcessIds: [
          createdProcesses[0]?.id,
          createdProcesses[1]?.id,
        ].filter(Boolean),
        affectedLocations: ["Primary Data Center"],
        affectedSystems: ["Payment System", "Reporting Database"],
        detectionTime: new Date("2026-01-15T09:00:00Z"),
        reportTime: new Date("2026-01-15T09:05:00Z"),
        responseStartTime: new Date("2026-01-15T09:10:00Z"),
        resolutionTime: new Date("2026-01-15T11:00:00Z"),
        initialResponseActions:
          "Activated backup server, initiated manual transaction reconciliation",
        escalationDetails: "Escalated to VP of Operations",
        rootCause: "Disk array controller failure",
        correctiveActions: "Replaced failed hardware components",
        reportedBy: "System Monitor Alert",
        assignedTo: "Database Administrator",
        organizationId: "ORG-001",
      },
      {
        incidentNumber: "INC-2026-002",
        title: "Cyber Attack - Ransomware Detection",
        description:
          "Ransomware detected on network segment containing document repository",
        category: "MALICIOUS_ACTIVITY",
        severity: "HIGH",
        status: "RESPONDING",
        businessImpact: "Document access restricted to prevent spread",
        estimatedFinancialImpact: 100000,
        affectedProcessIds: [
          createdProcesses[4]?.id,
          createdProcesses[5]?.id,
        ].filter(Boolean),
        affectedLocations: ["Corporate Office"],
        affectedSystems: ["Document Management System", "Shared File Storage"],
        detectionTime: new Date("2026-01-20T14:30:00Z"),
        reportTime: new Date("2026-01-20T14:35:00Z"),
        responseStartTime: new Date("2026-01-20T14:40:00Z"),
        initialResponseActions:
          "Isolated affected network segment, engaged cybersecurity team and law enforcement",
        escalationDetails: "CEO and Board notified",
        reportedBy: "Antivirus Alert",
        assignedTo: "IT Security Manager",
        organizationId: "ORG-001",
      },
      {
        incidentNumber: "INC-2026-003",
        title: "Natural Disaster - Flooding",
        description:
          "Unexpected flooding affected secondary data center facility",
        category: "NATURAL_DISASTER",
        severity: "HIGH",
        status: "ESCALATED",
        businessImpact:
          "Secondary site unavailable, increased load on primary datacenter",
        estimatedFinancialImpact: 200000,
        affectedProcessIds: [
          createdProcesses[2]?.id,
          createdProcesses[3]?.id,
        ].filter(Boolean),
        affectedLocations: ["Secondary Data Center"],
        affectedSystems: ["Backup Systems", "Disaster Recovery Site"],
        detectionTime: new Date("2026-01-18T02:00:00Z"),
        reportTime: new Date("2026-01-18T02:15:00Z"),
        responseStartTime: new Date("2026-01-18T02:30:00Z"),
        initialResponseActions:
          "Activated disaster recovery procedures, transferred workloads to primary site",
        escalationDetails: "Executive crisis team activated",
        rootCause: "Heavy rainfall exceeded drainage capacity",
        reportedBy: "Facility Manager",
        assignedTo: "Disaster Recovery Coordinator",
        organizationId: "ORG-001",
      },
    ];

    for (const incident of incidentData) {
      const created = await prisma.incident.create({
        data: incident as any,
      });
      incidents.push(created);
    }
    console.log(`✓ Created ${incidents.length} incidents\n`);

    // Summary
    console.log("═════════════════════════════════════════════════════");
    console.log("✨ DATABASE SEED COMPLETED SUCCESSFULLY ✨");
    console.log("═════════════════════════════════════════════════════\n");
    console.log("📊 Summary of created data:");
    console.log(`   • Business Processes: ${createdProcesses.length}`);
    console.log(`   • Impact Assessments: ${impacts.length}`);
    console.log(`   • Business Resources: ${resources.length}`);
    console.log(`   • Recovery Options: ${recoveryOptions.length}`);
    console.log(`   • Cost-Benefit Analyses: ${costBenefitAnalyses.length}`);
    console.log(`   • Strategy Approvals: ${strategyApprovals.length}`);
    console.log(`   • Risks: ${risks.length}`);
    console.log(`   • Threats: ${threats.length}`);
    console.log(`   • Incidents: ${incidents.length}`);
    console.log("\n");
    console.log("🎯 Key Test Scenarios:");
    console.log("   1. ✓ View all processes and their impact assessments");
    console.log("   2. ✓ Create temporal analysis for a process");
    console.log(
      "   3. ✓ Verify recovery objectives are calculated from temporal data",
    );
    console.log("   4. ✓ Test recovery options filtering by tier and type");
    console.log("   5. ✓ Analyze cost-benefit ratios and ROI calculations");
    console.log("   6. ✓ Track approval workflows through all stages");
    console.log("   7. ✓ Validate risk and threat assessment data\n");

    console.log("✅ Database is ready for testing!\n");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
