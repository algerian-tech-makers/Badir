import React from "react";
import { redirect, notFound } from "next/navigation";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getInitiativeDetailsAction } from "@/actions/admin";
import InitiativeDetails from "@/components/pages/admin/InitiativeDetails";

interface InitiativeDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InitiativeDetailsPage({
  params,
}: InitiativeDetailsPageProps) {
  const session = await getSessionWithCheckProfile();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const initiativeId = (await params).id;
  const result = await getInitiativeDetailsAction(initiativeId);

  if (!result.success) {
    if (result.error === "المبادرة غير موجودة") {
      notFound();
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            خطأ في تحميل تفاصيل المبادرة
          </h1>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  if (!result.data) return <div className="p-6">لا توجد مبادرات</div>;
  return <InitiativeDetails initiative={result.data} />;
}
