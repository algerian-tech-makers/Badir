import { auth } from "@/lib/auth";
import {
  InitiativeStatus,
  ParticipantRole,
  ParticipationStatus,
  Prisma,
  PrismaClient,
  TargetAudience,
} from "@prisma/client";

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

async function getOrCreateCategory({
  nameAr,
  nameEn,
  descriptionAr,
  descriptionEn,
  bgColor,
  textColor,
}: {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  bgColor: string;
  textColor: string;
}) {
  let category = await prisma.initiativeCategory.findFirst({
    where: { nameEn },
  });

  if (!category) {
    category = await prisma.initiativeCategory.create({
      data: {
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        bgColor,
        textColor,
        isActive: true,
      },
    });
  }

  return category;
}

async function getOrCreateInitiative(
  data: Prisma.InitiativeUncheckedCreateInput,
) {
  let initiative = await prisma.initiative.findFirst({
    where: { titleAr: data.titleAr },
  });

  if (!initiative) {
    initiative = await prisma.initiative.create({ data });
  }

  return initiative;
}

async function upsertParticipant(
  initiativeId: string,
  userId: string,
  status: ParticipationStatus,
  role: ParticipantRole = ParticipantRole.participant,
  participationForm?: Record<string, string | string[]>,
) {
  await prisma.initiativeParticipant.upsert({
    where: {
      unique_participation: { initiativeId, userId },
    },
    update: {
      status,
      participantRole: role,
      ...(participationForm ? { participationForm } : {}),
    },
    create: {
      initiativeId,
      userId,
      status,
      participantRole: role,
      ...(participationForm ? { participationForm } : {}),
    },
  });
}

async function upsertRating(
  userId: string,
  initiativeId: string,
  rating: number,
  comment?: string,
) {
  const existing = await prisma.userInitiativeRating.findFirst({
    where: { userId, initiativeId },
  });

  if (existing) {
    await prisma.userInitiativeRating.update({
      where: { id: existing.id },
      data: { rating, comment },
    });
  } else {
    await prisma.userInitiativeRating.create({
      data: { userId, initiativeId, rating, comment },
    });
  }
}

/**
 * Seed test data that exercises the /initiatives/joined page:
 * participation requests (registered), joined (approved), rejected and
 * kicked statuses, open/form-based participation, and the various filters
 * (category, target audience, initiative status, organizer type).
 */
async function createTestInitiatives(
  orgOwnerUserId: string,
  organizationId: string,
  normalUserId: string,
) {
  console.log("🧪 Creating test initiatives for joined page...");

  const volunteerCategory = await getOrCreateCategory({
    nameAr: "التطوع وخدمة المجتمع",
    nameEn: "Volunteering and Community Service",
    descriptionAr: "مبادرات تطوعية وخدمة المجتمع",
    descriptionEn: "Volunteering and community service initiatives",
    bgColor: "#F59E0B",
    textColor: "#FFFFFF",
  });

  const environmentCategory = await getOrCreateCategory({
    nameAr: "البيئة والمحافظة عليها",
    nameEn: "Environment and Conservation",
    descriptionAr: "مبادرات بيئية والحفاظ على الطبيعة",
    descriptionEn: "Environmental initiatives and nature conservation",
    bgColor: "#10B981",
    textColor: "#FFFFFF",
  });

  const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // 1. Ongoing open-participation initiative -> approved participant
  const treePlanting = await getOrCreateInitiative({
    organizerType: "organization",
    organizerOrgId: organizationId,
    categoryId: environmentCategory.id,
    titleAr: "حملة التشجير وإحياء الغابات",
    titleEn: "Tree Planting and Reforestation Campaign",
    descriptionAr:
      "مبادرة تطوعية لزراعة الأشجار وإحياء المناطق المتدهورة بيئياً",
    descriptionEn:
      "Volunteering initiative to plant trees and restore degraded areas",
    shortDescriptionAr: "حملة تشجير وطنية",
    shortDescriptionEn: "National tree planting campaign",
    location: "الجلفة",
    city: "الجلفة",
    state: "الجلفة",
    country: "Algeria",
    startDate: daysFromNow(-5),
    endDate: daysFromNow(15),
    status: InitiativeStatus.published,
    maxParticipants: 50,
    currentParticipants: 1,
    isOpenParticipation: true,
    targetAudience: TargetAudience.both,
  });

  // 2. Form-based participation -> pending registration request
  const kidsEducation = await getOrCreateInitiative({
    organizerType: "organization",
    organizerOrgId: organizationId,
    categoryId: volunteerCategory.id,
    titleAr: "مبادرة تعليم الأطفال القرآن",
    titleEn: "Quran Teaching Initiative for Children",
    descriptionAr: "مبادرة لتعليم الأطفال مبادئ القرآن الكريم والتلاوة الصحيحة",
    descriptionEn:
      "Initiative to teach children Quran principles and proper recitation",
    shortDescriptionAr: "تعليم الأطفال القرآن",
    shortDescriptionEn: "Teaching children the Quran",
    location: "الجزائر العاصمة",
    city: "الجزائر العاصمة",
    state: "الجزائر",
    country: "Algeria",
    startDate: daysFromNow(10),
    endDate: daysFromNow(20),
    status: InitiativeStatus.published,
    maxParticipants: 30,
    isOpenParticipation: false,
    participationQstForm: [
      {
        id: "motivation",
        question: "لماذا ترغب بالمشاركة في هذه المبادرة؟",
        type: "text",
        required: true,
      },
      {
        id: "experience",
        question: "هل لديك تجربة سابقة في تدريس الأطفال؟",
        type: "radio",
        required: false,
        options: ["نعم", "لا"],
      },
    ],
    targetAudience: TargetAudience.both,
  });

  // 3. Completed initiative -> rejected participant + rating
  const foodAid = await getOrCreateInitiative({
    organizerType: "organization",
    organizerOrgId: organizationId,
    categoryId: volunteerCategory.id,
    titleAr: "مبادرة توزيع المساعدات الغذائية",
    titleEn: "Food Aid Distribution Initiative",
    descriptionAr:
      "مبادرة مكتملة لتوزيع المساعدات الغذائية على العائلات المحتاجة",
    descriptionEn:
      "Completed initiative distributing food aid to families in need",
    shortDescriptionAr: "توزيع مساعدات غذائية",
    shortDescriptionEn: "Distributing food aid",
    location: "الجزائر العاصمة",
    city: "الجزائر العاصمة",
    state: "الجزائر",
    country: "Algeria",
    startDate: daysFromNow(-40),
    endDate: daysFromNow(-10),
    status: InitiativeStatus.completed,
    maxParticipants: 40,
    isOpenParticipation: true,
    targetAudience: TargetAudience.participants,
  });

  // 4. Published initiative -> kicked participant
  const elderlySupport = await getOrCreateInitiative({
    organizerType: "organization",
    organizerOrgId: organizationId,
    categoryId: environmentCategory.id,
    titleAr: "مبادرة دعم المسنين",
    titleEn: "Elderly Support Initiative",
    descriptionAr: "مبادرة لزيارة المسنين وتقديم الدعم النفسي والاجتماعي لهم",
    descriptionEn:
      "Initiative to visit the elderly and provide psychological and social support",
    shortDescriptionAr: "دعم وزيارة المسنين",
    shortDescriptionEn: "Supporting and visiting the elderly",
    location: "بجاية",
    city: "بجاية",
    state: "بجاية",
    country: "Algeria",
    startDate: daysFromNow(30),
    endDate: daysFromNow(40),
    status: InitiativeStatus.published,
    maxParticipants: 25,
    isOpenParticipation: true,
    targetAudience: TargetAudience.both,
  });

  // 5. User-organized initiative -> verifies organizer entries are excluded
  const eyeCheckup = await getOrCreateInitiative({
    organizerType: "user",
    organizerUserId: normalUserId,
    categoryId: environmentCategory.id,
    titleAr: "مبادرة فحص النظر",
    titleEn: "Eye Checkup Initiative",
    descriptionAr: "مبادرة لتنظيم فحوصات بصرية مجانية للمحتاجين",
    descriptionEn: "Initiative organizing free eye checkups for those in need",
    shortDescriptionAr: "فحوصات بصرية مجانية",
    shortDescriptionEn: "Free vision screenings",
    location: "وهران",
    city: "وهران",
    state: "وهران",
    country: "Algeria",
    startDate: daysFromNow(7),
    endDate: daysFromNow(14),
    status: InitiativeStatus.published,
    maxParticipants: 20,
    currentParticipants: 1,
    isOpenParticipation: true,
    targetAudience: TargetAudience.both,
  });

  // normuser: approved on 1, registered on 2, rejected on 3, kicked on 4
  await upsertParticipant(
    treePlanting.id,
    normalUserId,
    ParticipationStatus.approved,
  );
  await upsertParticipant(
    kidsEducation.id,
    normalUserId,
    ParticipationStatus.registered,
    ParticipantRole.participant,
    {
      motivation: "أرغب في تعليم الأطفال وتعزيز القيم",
      experience: "نعم",
    },
  );
  await upsertParticipant(
    foodAid.id,
    normalUserId,
    ParticipationStatus.rejected,
  );
  await upsertParticipant(
    elderlySupport.id,
    normalUserId,
    ParticipationStatus.kicked,
  );

  // org owner: approved on the user-organized initiative
  await upsertParticipant(
    eyeCheckup.id,
    orgOwnerUserId,
    ParticipationStatus.approved,
  );

  // rating on the completed initiative
  await upsertRating(normalUserId, foodAid.id, 4.5, "مبادرة ممتازة");

  console.log("✅ Test initiatives seeded!");
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
  await createTestInitiatives(user.id, organization.id, normalUser.id);

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
