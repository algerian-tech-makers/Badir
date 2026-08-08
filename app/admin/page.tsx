import { redirect } from "next/navigation";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getAdminStatsAction, getUsersAction } from "@/actions/admin";
import AdminDashboard from "@/components/pages/admin/Dashboard";
import { isManagementRole } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

export default async function AdminPage() {
  const session = await getSessionWithCheckProfile();

  if (!session || !isManagementRole(session.user.role)) {
    redirect("/");
  }

  const statsResult = await getAdminStatsAction();
  const usersResult = await getUsersAction({}, 1, 20);

  if (!statsResult.success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">
            خطأ في تحميل البيانات
          </h1>
          <p className="text-gray-600">{statsResult.error}</p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      initialStats={statsResult.data}
      initialUsers={usersResult.success ? usersResult.data : undefined}
      canManageOrganizations={session.user.role === "ADMIN"}
      viewerRole={session.user.role as UserRole}
    />
  );
}
