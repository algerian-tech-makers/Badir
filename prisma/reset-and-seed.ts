// prisma/reset-and-seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log("🗑️  Resetting database...");

  // Delete in reverse dependency order
  await prisma.postAttachment.deleteMany({});
  await prisma.initiativePost.deleteMany({});
  await prisma.initiativeParticipant.deleteMany({});
  await prisma.userInitiativeRating.deleteMany({});
  await prisma.supportRequest.deleteMany({});
  await prisma.initiative.deleteMany({});
  await prisma.initiativeCategory.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.userQualification.deleteMany({});
  await prisma.platformRating.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.verification.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Database reset completed!");
}

async function seedDatabase() {
  console.log("🌱 Starting to seed the database...");

  // Create user
  console.log("👤 Creating user...");
  const user = await prisma.user.create({
    data: {
      id: "user_org_owner",
      name: "Organization Owner",
      email: "org@example.com",
      emailVerified: true,
      firstName: "Organization",
      lastName: "Owner",
      userType: "organization",
      profileCompleted: true,
      city: "الجزائر العاصمة",
      state: "الجزائر",
      country: "Algeria",
      sex: "male",
      isActive: true,
    },
  });

  // Create organization
  console.log("🏢 Creating organization...");
  const organization = await prisma.organization.create({
    data: {
      userId: user.id,
      name: "جمعية الأمل الخيرية",
      shortName: "الأمل",
      description: "جمعية خيرية تهدف إلى خدمة المجتمع",
      contactEmail: "info@amal.org",
      state: "الجزائر",
      city: "الجزائر العاصمة",
      country: "Algeria",
      organizationType: "charity",
      workAreas: ["education", "health", "humanitarian"],
      userRole: "manager",
      status: "approved",
    },
  });

  // Create category
  console.log("📂 Creating initiative category...");
  const category = await prisma.initiativeCategory.create({
    data: {
      nameAr: "التطوع وخدمة المجتمع",
      nameEn: "Volunteering and Community Service",
      descriptionAr: "مبادرات تطوعية وخدمة المجتمع",
      descriptionEn: "Volunteering and community service initiatives",
      // icon: "users",
      bgColor: "#F59E0B",
      textColor: "#FFFFFF",
      isActive: true,
    },
  });

  // Calculate dates
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 20);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 25);

  // Create initiative
  console.log("🚀 Creating initiative...");
  const initiative = await prisma.initiative.create({
    data: {
      organizerType: "organization",
      organizerOrgId: organization.id,
      categoryId: category.id,
      titleAr: "مبادرة خدمة المجتمع",
      titleEn: "Community Service Initiative",
      descriptionAr: "مبادرة تطوعية لخدمة المجتمع وتقديم المساعدة للمحتاجين",
      descriptionEn:
        "Volunteering initiative to serve the community and help those in need",
      shortDescriptionAr: "مبادرة تطوعية لخدمة المجتمع",
      shortDescriptionEn: "Volunteering initiative for community service",
      location: "الجزائر العاصمة",
      city: "الجزائر العاصمة",
      state: "الجزائر",
      country: "Algeria",
      startDate: startDate,
      endDate: endDate,
      status: "published",
      maxParticipants: 50,
      isOpenParticipation: true,
      targetAudience: "both",
    },
  });

  // Create post
  console.log("📝 Creating initiative post...");
  await prisma.initiativePost.create({
    data: {
      initiativeId: initiative.id,
      authorId: user.id,
      title: "مرحباً بكم في المبادرة",
      content: "نرحب بجميع المتطوعين للمشاركة في هذه المبادرة الخيرية",
      postType: "announcement",
      isPinned: true,
      status: "published",
    },
  });

  console.log("✅ Seeding completed successfully!");
  console.log(`📅 Initiative starts: ${startDate.toLocaleDateString()}`);
  console.log(`📅 Initiative ends: ${endDate.toLocaleDateString()}`);
}

async function main() {
  await resetDatabase();
  await seedDatabase();
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
  });
