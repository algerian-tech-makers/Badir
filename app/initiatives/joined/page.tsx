import JoinedInitiatives from "@/components/pages/initiatives/JoinedInitiatives";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { ParticipationService } from "@/services/participations";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "مبادراتي - بادر",
  description: "المبادرات التي انضممت إليها",
};

export default async function Page() {
  const session = await getSessionWithCheckProfile();

  if (session === null) {
    redirect("/login");
  }

  try {
    const initialData = await ParticipationService.getJoinedParticipations(
      session.user.id,
      {},
      { page: 1, limit: 12 },
    );

    return <JoinedInitiatives initialData={initialData} />;
  } catch (error) {
    console.error("Error loading joined initiatives page:", error);
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
