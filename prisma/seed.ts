import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting to seed the database...");

  // Create a single user (organization owner)
  console.log("👤 Creating user...");
  const user = await prisma.user.upsert({
    where: { email: "org@example.com" },
    update: {},
    create: {
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

  // Create a single organization
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

  // Create a single initiative category
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

  // Calculate dates: start in 20 days, end in 25 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 20);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 25);

  // Create a single initiative
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

  // Create a single post for the initiative
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

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Disconnected from database");
  });
