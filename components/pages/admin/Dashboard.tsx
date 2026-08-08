"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@prisma/client";
import { AdminService, AdminUserCard } from "@/services/admin";
import { OverviewTab } from "./dashboard-tabs/OverviewTab";
import { OrganizationsTab } from "./dashboard-tabs/OrganizationsTab";
import { InitiativesTab } from "./dashboard-tabs/InitiativesTab";
import UserManagementTable from "./UserManagementTable";
import { PaginatedResponse } from "@/types/Pagination";

type AdminStatsType = Awaited<ReturnType<typeof AdminService.getAdminStats>>;
type AdminUsersType = Awaited<ReturnType<typeof AdminService.getUsers>>;

interface AdminDashboardProps {
  initialStats?: AdminStatsType;
  initialUsers?: AdminUsersType;
  canManageOrganizations?: boolean;
  viewerRole: UserRole;
}

const AdminDashboard = ({
  initialStats,
  initialUsers,
  canManageOrganizations = true,
  viewerRole,
}: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats] = useState<AdminStatsType>(
    initialStats || {
      organizations: { pending: 0, approved: 0, rejected: 0, total: 0 },
      initiatives: { draft: 0, published: 0, cancelled: 0, total: 0 },
    },
  );
  const noPaginationUsers: PaginatedResponse<AdminUserCard> | null =
    initialUsers
      ? {
          ...initialUsers!,
          pagination: {
            ...initialUsers!.pagination,
            hasNext: false,
            hasPrev: false,
            totalPages: 1,
          },
        }
      : null;
  const isAdmin = viewerRole === "ADMIN";

  return (
    <div className="mx-auto max-w-7xl p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          لوحة تحكم المسؤول
        </h1>
        <p className="text-gray-600">
          {isAdmin
            ? "إدارة المنظمات والمبادرات"
            : "إدارة المستخدمين والمبادرات"}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-col"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">الإحصائيات</TabsTrigger>
          <TabsTrigger value={isAdmin ? "organizations" : "users"}>
            {isAdmin ? "المنظمات" : "المستخدمون"}
          </TabsTrigger>
          <TabsTrigger value="initiatives">المبادرات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab stats={stats} />
        </TabsContent>

        {isAdmin ? (
          <TabsContent value="organizations">
            <OrganizationsTab canManageOrganizations={canManageOrganizations} />
          </TabsContent>
        ) : (
          <TabsContent value="users">
            <UserManagementTable
              initialData={
                noPaginationUsers || {
                  data: [],
                  pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    totalPages: 0,
                    hasNext: false,
                    hasPrev: false,
                  },
                }
              }
              viewerRole={viewerRole}
              inDashaboard={true}
            />
          </TabsContent>
        )}

        <TabsContent value="initiatives">
          <InitiativesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
