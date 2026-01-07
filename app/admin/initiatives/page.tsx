import React from "react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getUserInitiativesAction } from "@/actions/admin";
import InitiativesManagement from "@/components/pages/admin/InitiativesManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { InitiativeStatus } from "@prisma/client";

interface SearchParams {
  page?: string;
  status?: string;
  search?: string;
  categoryId?: string;
}

interface InitiativesPageProps {
  searchParams: SearchParams;
}

function InitiativesLoading() {
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

async function InitiativesContent({ searchParams }: InitiativesPageProps) {
  const { page, status, search, categoryId } = searchParams;
  const filters = {
    status: status as InitiativeStatus | undefined,
    search: search || "",
    categoryId: categoryId || "",
  };

  const result = await getUserInitiativesAction(
    filters,
    parseInt(page || "1", 10),
    10,
  );

  if (!result.success) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            خطأ في تحميل المبادرات
          </h2>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  if (!result.data) return <div className="p-6">لا توجد مبادرات</div>;
  return <InitiativesManagement initialData={result.data} />;
}

export default async function InitiativesPage({
  searchParams,
}: InitiativesPageProps) {
  const awaitedSearchParams = await searchParams;
  const session = await getSessionWithCheckProfile();

  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <Suspense fallback={<InitiativesLoading />}>
      <InitiativesContent searchParams={awaitedSearchParams} />
    </Suspense>
  );
}
