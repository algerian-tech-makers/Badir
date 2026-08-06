import React from "react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getOrganizationsAction } from "@/actions/admin";
import OrganizationsManagement from "@/components/pages/admin/OrganizationsManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isManagementRole } from "@/lib/permissions";

interface SearchParams {
  page?: string;
  status?: string;
  search?: string;
  organizationType?: string;
}

interface OrganizationsPageProps {
  searchParams: SearchParams;
}

function OrganizationsLoading() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="mb-2 h-6 w-64" />
                <Skeleton className="mb-4 h-4 w-48" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function OrganizationsContent({
  searchParams,
  canManage,
}: OrganizationsPageProps & { canManage: boolean }) {
  const { page, status, search, organizationType } = searchParams;
  const filters = {
    status: status as any,
    search: search || "",
    organizationType: organizationType || "",
  };

  const result = await getOrganizationsAction(
    filters,
    parseInt(page || "1", 10),
    10,
  );

  if (!result.success) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            خطأ في تحميل المنظمات
          </h2>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  if (!result.data) return <div className="p-6">لا توجد منظمات</div>;

  return (
    <OrganizationsManagement initialData={result.data} canManage={canManage} />
  );
}

export default async function OrganizationsPage({
  searchParams,
}: OrganizationsPageProps) {
  const awaitedSearchParams = await searchParams;
  const session = await getSessionWithCheckProfile();

  if (!session || !isManagementRole(session.user.role)) {
    redirect("/");
  }

  return (
    <Suspense fallback={<OrganizationsLoading />}>
      <OrganizationsContent
        searchParams={awaitedSearchParams}
        canManage={session.user.role === "ADMIN"}
      />
    </Suspense>
  );
}
