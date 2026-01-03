import React from "react";
import { redirect } from "next/navigation";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getApprovedOrganizationsAction } from "@/actions/admin";
import PartnersManagement from "@/components/pages/admin/PartnersManagement";

interface PartnersPageProps {
  searchParams: { search?: string; page?: string };
}

export default async function PartnersPage({
  searchParams,
}: PartnersPageProps) {
  const session = await getSessionWithCheckProfile();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search || "";

  const result = await getApprovedOrganizationsAction({ search }, page, 20);

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            خطأ في تحميل المنظمات
          </h1>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  return <PartnersManagement initialData={result.data} currentPage={page} />;
}
