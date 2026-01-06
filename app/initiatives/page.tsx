import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { InitiativeService } from "@/services/initiatives";
import { CategoryService } from "@/services/categories";
import InitiativesList from "@/components/pages/initiatives/InitiativesList";
import { OrganizationStatus, UserType } from "@prisma/client";
import { OrganizationService } from "@/services/organizations";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "المبادرات - بادر",
  description: "استعرض المبادرات المختلفة على منصة بادر",
};

export default async function Page() {
  const session = await getSessionWithCheckProfile();

  try {
    const [initialInitiatives, categories] = await Promise.all([
      InitiativeService.getMany({}, { page: 1, limit: 12 }),
      CategoryService.getAll(),
    ]);

    let org = null;
    if (session?.user.userType === UserType.organization) {
      org = await OrganizationService.getOrganizationByUserId(session.user.id);
    }

    return (
      <InitiativesList
        initialData={initialInitiatives}
        categories={categories}
        isOrg={!!org}
        isOrgVerified={org?.status === OrganizationStatus.approved}
        userId={session?.user.id}
      />
    );
  } catch (error) {
    console.error("Error loading initiatives page:", error);
    return (
      <div className="bg-neutrals-100 flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-neutrals-700 mb-4 text-2xl font-bold">
            حدث خطأ أثناء تحميل المبادرات
          </h1>
          <p className="text-neutrals-500">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }
}
