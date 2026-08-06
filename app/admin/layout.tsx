import { Metadata } from "next";
import { redirect } from "next/navigation";
import getSessionWithCheckProfile from "@/hooks/getSessionWithCheckProfile";
import AdminSidebar from "@/components/pages/admin/AdminSidebar";
import { isManagementRole } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "لوحة تحكم المسؤول",
  description: "إدارة المنظمات والمبادرات",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithCheckProfile();
  if (!session || !isManagementRole(session.user.role)) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar role={session.user.role} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
