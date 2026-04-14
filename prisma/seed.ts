import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUserAndAccount(
  userId: string,
  email: string,
  name: string,
  firstName: string,
  lastName: string,
  userType: "helper" | "participant" | "both" | "organization",
  role: "USER" | "ADMIN",
  passwordHash: string,
) {
  console.log(`👤 Creating user ${email}...`);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: userId,
      name,
      email,
      emailVerified: true,
      firstName,
      lastName,
      userType,
      profileCompleted: true,
      city: "الجزائر العاصمة",
      state: "الجزائر",
      country: "Algeria",
      sex: "male",
      isActive: true,
      role,
    },
  });

  console.log(`👤 Creating account for ${email}...`);
  await prisma.account.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      accountId: userId,
      providerId: "credential",
      userId: userId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return user;
}

async function createAdminUser(passwordHash: string) {
  return createUserAndAccount(
    "user_admin",
    "admin@example.com",
    "Admin User",
    "Admin",
    "User",
    "both",
    "ADMIN",
    passwordHash,
  );
}

async function createNormalUser(passwordHash: string) {
  return createUserAndAccount(
    "user_normal",
    "user@example.com",
    "Normal User",
    "Normal",
    "User",
    "both",
    "USER",
    passwordHash,
  );
}

async function createOrganizationUser(passwordHash: string) {
  const user = await createUserAndAccount(
    "user_org_owner",
    "org@example.com",
    "Organization Owner",
    "Organization",
    "Owner",
    "organization",
    "USER",
    passwordHash,
  );

  console.log("🏢 Creating organization...");
  let organization = await prisma.organization.findFirst({
    where: { userId: user.id },
  });

  if (!organization) {
    organization = await prisma.organization.create({
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
  }

  return { user, organization };
}

async function createInitiative(organizationId: string, authorId: string) {
  console.log("📂 Creating initiative category...");
  let category = await prisma.initiativeCategory.findFirst({
    where: { nameEn: "Volunteering and Community Service" },
  });

  if (!category) {
    category = await prisma.initiativeCategory.create({
      data: {
        nameAr: "التطوع وخدمة المجتمع",
        nameEn: "Volunteering and Community Service",
        descriptionAr: "مبادرات تطوعية وخدمة المجتمع",
        descriptionEn: "Volunteering and community service initiatives",
        bgColor: "#F59E0B",
        textColor: "#FFFFFF",
        isActive: true,
      },
    });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 20);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 25);

  console.log("🚀 Creating initiative...");
  const initiative = await prisma.initiative.create({
    data: {
      organizerType: "organization",
      organizerOrgId: organizationId,
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

  console.log("📝 Creating initiative post...");
  await prisma.initiativePost.create({
    data: {
      initiativeId: initiative.id,
      authorId: authorId,
      title: "مرحباً بكم في المبادرة",
      content: "نرحب بجميع المتطوعين للمشاركة في هذه المبادرة الخيرية",
      postType: "announcement",
      isPinned: true,
      status: "published",
    },
  });

  console.log(`📅 Initiative starts: ${startDate.toLocaleDateString()}`);
  console.log(`📅 Initiative ends: ${endDate.toLocaleDateString()}`);
}

async function createUserInitiative(authorId: string) {
  console.log("📂 Fetching initiative category for user initiative...");
  let category = await prisma.initiativeCategory.findFirst({
    where: { nameEn: "Volunteering and Community Service" },
  });

  if (!category) {
    category = await prisma.initiativeCategory.create({
      data: {
        nameAr: "التطوع وخدمة المجتمع",
        nameEn: "Volunteering and Community Service",
        descriptionAr: "مبادرات تطوعية وخدمة المجتمع",
        descriptionEn: "Volunteering and community service initiatives",
        bgColor: "#F59E0B",
        textColor: "#FFFFFF",
        isActive: true,
      },
    });
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 40);

  console.log("🚀 Creating user initiative (Draft) for review...");
  const initiative = await prisma.initiative.create({
    data: {
      organizerType: "user",
      organizerUserId: authorId,
      categoryId: category.id,
      titleAr: "مبادرة تنظيف الشواطئ",
      titleEn: "Beach Cleanup Initiative",
      descriptionAr: "مبادرة تطوعية لتنظيف الشواطئ، ننتظر الموافقة للبدء.",
      descriptionEn:
        "Volunteering initiative to clean up beaches, awaiting approval.",
      shortDescriptionAr: "حملة تنظيف الشواطئ",
      shortDescriptionEn: "Beach cleanup campaign",
      location: "وهران",
      city: "وهران",
      state: "وهران",
      country: "Algeria",
      startDate: startDate,
      endDate: endDate,
      status: "draft",
      maxParticipants: 30,
      isOpenParticipation: true,
      targetAudience: "both",
    },
  });

  console.log(`📅 Draft Initiative starts: ${startDate.toLocaleDateString()}`);
}

async function main() {
  const ctx = await auth.$context;

  const plainPassword = "DEV-ADMIN-PASSWORD";
  const hashed = await ctx.password.hash(plainPassword);

  await createAdminUser(hashed);
  const normalUser = await createNormalUser(hashed);

  const { user, organization } = await createOrganizationUser(hashed);
  await createInitiative(organization.id, user.id);
  await createUserInitiative(normalUser.id);

  console.log("✅ Seeding completed successfully!");
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
