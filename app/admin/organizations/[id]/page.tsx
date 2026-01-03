import React from "react";
import { redirect, notFound } from "next/navigation";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getOrganizationDetailsAction } from "@/actions/admin";
import OrganizationDetails from "@/components/pages/admin/OrganizationDetails";

interface OrganizationDetailsPageProps {
  params: { id: string };
}

export default async function OrganizationDetailsPage({
  params,
}: OrganizationDetailsPageProps) {
  const { id } = await params;
  const session = await getSessionWithCheckProfile();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const result = await getOrganizationDetailsAction(id);

  if (!result.success) {
    if (result.error === "المنظمة غير موجودة") {
      notFound();
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            خطأ في تحميل تفاصيل المنظمة
          </h1>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  if (!result.data) return <div className="p-6">لا توجد منظمة</div>;
  return <OrganizationDetails organization={result.data} />;
}
