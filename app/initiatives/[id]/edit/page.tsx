import InitiativeForm from "@/components/pages/initiatives/InitiativeForm";
import { InitiativeService } from "@/services/initiatives";
import { CategoryService } from "@/services/categories";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { notFound, redirect } from "next/navigation";
import { InitiativeStatus } from "@prisma/client";
import BackButton from "@/components/BackButton";

export default async function EditInitiativePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const session = await getSessionWithCheckProfile();
  if (!session) redirect("/login");

  const initiative = await InitiativeService.getById(id, session.user.id);
  if (!initiative) notFound();

  // only manager can edit the initiative
  const isManager =
    session.user.id === initiative.organizerUserId ||
    session.user.id === initiative.organizerOrg?.userId;
  if (!isManager) notFound();

  // a completed initiative is read-only: it can be visited but not edited
  if (initiative.status === InitiativeStatus.completed) {
    redirect(`/initiatives/${id}`);
  }

  const categories = await CategoryService.getAll();
  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.nameAr,
  }));

  return (
    <div className="container mx-auto max-w-full px-2 py-8 sm:px-6" dir="rtl">
      <div className="mb-4 flex justify-end">
        <BackButton />
      </div>
      <h1 className="text-primary-600 mb-6 text-center text-3xl font-bold">
        تعديل المبادرة
      </h1>
      <InitiativeForm
        categories={categoryOptions}
        initialData={initiative}
        isOrganization={session.user.userType === "organization"}
      />
    </div>
  );
}
