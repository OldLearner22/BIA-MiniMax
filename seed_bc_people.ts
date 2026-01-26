import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedBCData() {
  console.log("🌱 Seeding BC People, Teams, and Roles data...");

  const organizationId = "00000000-0000-0000-0000-000000000001";

  // Seed 20 people (Sarah Johnson as CEO, etc.)
  const people = [
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@company.com",
      jobTitle: "Chief Executive Officer",
      department: "Executive",
      phone: "+1-555-0101",
      mobile: "+1-555-0102",
    },
    {
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@company.com",
      jobTitle: "Chief Technology Officer",
      department: "IT",
      phone: "+1-555-0103",
      mobile: "+1-555-0104",
    },
    {
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@company.com",
      jobTitle: "Chief Operations Officer",
      department: "Operations",
      phone: "+1-555-0105",
      mobile: "+1-555-0106",
    },
    {
      firstName: "David",
      lastName: "Kim",
      email: "david.kim@company.com",
      jobTitle: "IT Director",
      department: "IT",
      phone: "+1-555-0107",
      mobile: "+1-555-0108",
    },
    {
      firstName: "Jennifer",
      lastName: "Williams",
      email: "jennifer.williams@company.com",
      jobTitle: "Communications Director",
      department: "Communications",
      phone: "+1-555-0109",
      mobile: "+1-555-0110",
    },
    {
      firstName: "Robert",
      lastName: "Brown",
      email: "robert.brown@company.com",
      jobTitle: "Security Manager",
      department: "Security",
      phone: "+1-555-0111",
      mobile: "+1-555-0112",
    },
    {
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.anderson@company.com",
      jobTitle: "HR Manager",
      department: "Human Resources",
      phone: "+1-555-0113",
      mobile: "+1-555-0114",
    },
    {
      firstName: "James",
      lastName: "Taylor",
      email: "james.taylor@company.com",
      jobTitle: "Senior IT Engineer",
      department: "IT",
      phone: "+1-555-0115",
      mobile: "+1-555-0116",
    },
    {
      firstName: "Maria",
      lastName: "Garcia",
      email: "maria.garcia@company.com",
      jobTitle: "Network Administrator",
      department: "IT",
      phone: "+1-555-0117",
      mobile: "+1-555-0118",
    },
    {
      firstName: "Christopher",
      lastName: "Martinez",
      email: "christopher.martinez@company.com",
      jobTitle: "Database Administrator",
      department: "IT",
      phone: "+1-555-0119",
      mobile: "+1-555-0120",
    },
    {
      firstName: "Amanda",
      lastName: "Lee",
      email: "amanda.lee@company.com",
      jobTitle: "Operations Manager",
      department: "Operations",
      phone: "+1-555-0121",
      mobile: "+1-555-0122",
    },
    {
      firstName: "Daniel",
      lastName: "White",
      email: "daniel.white@company.com",
      jobTitle: "Facilities Manager",
      department: "Facilities",
      phone: "+1-555-0123",
      mobile: "+1-555-0124",
    },
    {
      firstName: "Jessica",
      lastName: "Harris",
      email: "jessica.harris@company.com",
      jobTitle: "PR Specialist",
      department: "Communications",
      phone: "+1-555-0125",
      mobile: "+1-555-0126",
    },
    {
      firstName: "Matthew",
      lastName: "Clark",
      email: "matthew.clark@company.com",
      jobTitle: "Customer Support Lead",
      department: "Support",
      phone: "+1-555-0127",
      mobile: "+1-555-0128",
    },
    {
      firstName: "Ashley",
      lastName: "Lewis",
      email: "ashley.lewis@company.com",
      jobTitle: "Finance Manager",
      department: "Finance",
      phone: "+1-555-0129",
      mobile: "+1-555-0130",
    },
    {
      firstName: "Joshua",
      lastName: "Walker",
      email: "joshua.walker@company.com",
      jobTitle: "Legal Counsel",
      department: "Legal",
      phone: "+1-555-0131",
      mobile: "+1-555-0132",
    },
    {
      firstName: "Stephanie",
      lastName: "Hall",
      email: "stephanie.hall@company.com",
      jobTitle: "Compliance Officer",
      department: "Compliance",
      phone: "+1-555-0133",
      mobile: "+1-555-0134",
    },
    {
      firstName: "Andrew",
      lastName: "Allen",
      email: "andrew.allen@company.com",
      jobTitle: "Business Analyst",
      department: "Operations",
      phone: "+1-555-0135",
      mobile: "+1-555-0136",
    },
    {
      firstName: "Michelle",
      lastName: "Young",
      email: "michelle.young@company.com",
      jobTitle: "Project Manager",
      department: "Operations",
      phone: "+1-555-0137",
      mobile: "+1-555-0138",
    },
    {
      firstName: "Kevin",
      lastName: "King",
      email: "kevin.king@company.com",
      jobTitle: "Risk Manager",
      department: "Risk Management",
      phone: "+1-555-0139",
      mobile: "+1-555-0140",
    },
  ];

  console.log("Inserting people...");
  for (const person of people) {
    await prisma.$executeRaw`
      INSERT INTO bc_people (
        first_name, last_name, email, job_title, department, 
        phone, mobile, employment_status, organization_id
      ) VALUES (
        ${person.firstName}, ${person.lastName}, ${person.email}, 
        ${person.jobTitle}, ${person.department}, ${person.phone}, 
        ${person.mobile}, 'active', ${organizationId}::uuid
      )
      ON CONFLICT (email) DO NOTHING
    `;
  }

  // Seed 3 standard teams
  console.log("Inserting standard teams...");
  const teams = [
    {
      name: "Crisis Management Team",
      description: "Executive level crisis response team",
      structureType: "crisis_team",
      level: 1,
      x: 400,
      y: 50,
    },
    {
      name: "IT Recovery Team",
      description: "Technology infrastructure recovery",
      structureType: "recovery_team",
      level: 2,
      x: 100,
      y: 300,
    },
    {
      name: "Communications Team",
      description: "Crisis communications & stakeholder management",
      structureType: "communication_team",
      level: 2,
      x: 700,
      y: 300,
    },
  ];

  for (const team of teams) {
    await prisma.$executeRaw`
      INSERT INTO bc_team_structure (
        name, description, structure_type, level, display_order,
        is_active, position_x, position_y, organization_id
      ) VALUES (
        ${team.name}, ${team.description}, ${team.structureType}, ${team.level}, 0,
        true, ${team.x}, ${team.y}, ${organizationId}::uuid
      )
      ON CONFLICT DO NOTHING
    `;
  }

  console.log("✅ Successfully seeded people and teams!");
}

seedBCData()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
