import { Suspense } from "react";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getUsersAction } from "@/actions/admin";
import UserManagementTable from "@/components/pages/admin/UserManagementTable";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isManagementRole } from "@/lib/permissions";

interface SearchParams {
  q?: string;
  role?: string;
  page?: string;
}

interface UsersPageProps {
  searchParams: SearchParams;
}

function UsersLoading() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function UsersContent({
  searchParams,
  viewerRole,
}: UsersPageProps & { viewerRole: UserRole }) {
  const page = Math.max(Number.parseInt(searchParams.page ?? "1", 10) || 1, 1);
  const role = searchParams.role;
  const normalizedRole: UserRole | "all" | undefined =
    role && Object.values(UserRole).includes(role as UserRole)
      ? (role as UserRole)
      : role === "all"
        ? "all"
        : undefined;

  const filters = {
    q: searchParams.q?.trim() || "",
    role: normalizedRole,
  };

  const result = await getUsersAction(filters, page, 20);

  if (!result.success || !result.data) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-red-600">
            خطأ في تحميل المستخدمين
          </h2>
          <p className="text-gray-600">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <UserManagementTable initialData={result.data} viewerRole={viewerRole} />
  );
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const awaitedSearchParams = await searchParams;
  const session = await getSessionWithCheckProfile();

  if (!session || !isManagementRole(session.user.role)) {
    redirect("/");
  }

  return (
    <Suspense fallback={<UsersLoading />}>
      <UsersContent
        searchParams={awaitedSearchParams}
        viewerRole={session.user.role as UserRole}
      />
    </Suspense>
  );
}
