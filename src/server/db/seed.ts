import { db } from "./index";
import { campaigns, audiences, audienceMembers, content, channels } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Create sample channels
  const [emailChannel] = await db
    .insert(channels)
    .values({
      type: "email",
      name: "Primary Email Service",
      configuration: {
        provider: "sendgrid",
        apiKey: "placeholder",
      },
      isActive: true,
      dailyLimit: 10000,
    })
    .returning();

  const [smsChannel] = await db
    .insert(channels)
    .values({
      type: "sms",
      name: "SMS Provider",
      configuration: {
        provider: "twilio",
        accountSid: "placeholder",
        authToken: "placeholder",
      },
      isActive: false,
      dailyLimit: 1000,
    })
    .returning();

  console.log("✅ Created channels");

  // Create sample campaign
  const [campaign] = await db
    .insert(campaigns)
    .values({
      name: "Product Launch Campaign",
      goal: "Launch our new SaaS product to generate 1000 sign-ups in the first month, targeting SMB decision makers in North America",
      status: "draft",
    })
    .returning();

  console.log("✅ Created sample campaign:", campaign.name);

  // Create sample audience
  const [audience] = await db
    .insert(audiences)
    .values({
      campaignId: campaign.id,
      name: "SMB Decision Makers",
      description: "Small to medium business owners and managers",
      criteria: {
        jobTitles: ["CEO", "CTO", "VP", "Director", "Manager"],
        companySize: "10-500",
        location: "North America",
      },
      memberCount: 0,
    })
    .returning();

  console.log("✅ Created sample audience:", audience.name);

  // Create sample audience members
  const sampleMembers = [
    {
      audienceId: audience.id,
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      attributes: { company: "Tech Corp", jobTitle: "CEO" },
      engagementScore: 0.85,
    },
    {
      audienceId: audience.id,
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      attributes: { company: "Startup Inc", jobTitle: "CTO" },
      engagementScore: 0.72,
    },
    {
      audienceId: audience.id,
      email: "bob.johnson@example.com",
      firstName: "Bob",
      lastName: "Johnson",
      attributes: { company: "SMB Solutions", jobTitle: "VP Marketing" },
      engagementScore: 0.91,
    },
  ];

  await db.insert(audienceMembers).values(sampleMembers);

  // Update audience member count
  await db
    .update(audiences)
    .set({ memberCount: sampleMembers.length })
    .where(eq(audiences.id, audience.id));

  console.log("✅ Created sample audience members");

  // Create sample content
  await db.insert(content).values({
    campaignId: campaign.id,
    type: "email",
    title: "Welcome Email",
    subject: "Transform Your Business with Our New SaaS Solution",
    body: "Dear [First Name],\n\nWe're excited to introduce our revolutionary SaaS platform...",
    metadata: {
      tone: "professional",
      target: "decision-makers",
    },
  });

  await db.insert(content).values({
    campaignId: campaign.id,
    type: "social_post",
    title: "LinkedIn Launch Post",
    body: "🚀 Exciting news! We're launching a game-changing SaaS platform that helps businesses...",
    metadata: {
      platform: "linkedin",
      hashtags: ["#SaaS", "#BusinessGrowth", "#Innovation"],
    },
  });

  console.log("✅ Created sample content");

  console.log("\n🎉 Database seeded successfully!\n");
  console.log("Sample campaign ID:", campaign.id);

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
