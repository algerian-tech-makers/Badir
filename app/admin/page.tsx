import { redirect } from "next/navigation";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import { getAdminStatsAction } from "@/actions/admin";
import AdminDashboard from "@/components/pages/admin/Dashboard";
import { isManagementRole } from "@/lib/permissions";

export default async function AdminPage() {
  const session = await getSessionWithCheckProfile();

  if (!session || !isManagementRole(session.user.role)) {
    redirect("/");
  }

  const statsResult = await getAdminStatsAction();

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
      canManageOrganizations={session.user.role === "ADMIN"}
    />
  );
}
