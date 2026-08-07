"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminService } from "@/services/admin";
import { OverviewTab } from "./dashboard-tabs/OverviewTab";
import { OrganizationsTab } from "./dashboard-tabs/OrganizationsTab";
import { InitiativesTab } from "./dashboard-tabs/InitiativesTab";

type AdminStatsType = Awaited<ReturnType<typeof AdminService.getAdminStats>>;

interface AdminDashboardProps {
  initialStats?: AdminStatsType;
  canManageOrganizations?: boolean;
}

const AdminDashboard = ({
  initialStats,
  canManageOrganizations = true,
}: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats] = useState<AdminStatsType>(
    initialStats || {
      organizations: { pending: 0, approved: 0, rejected: 0, total: 0 },
      initiatives: { draft: 0, published: 0, cancelled: 0, total: 0 },
    },
  );

  return (
    <div className="mx-auto max-w-7xl p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          لوحة تحكم المسؤول
        </h1>
        <p className="text-gray-600">إدارة المنظمات والمبادرات</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex-col"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">الإحصائيات</TabsTrigger>
          <TabsTrigger value="organizations">المنظمات</TabsTrigger>
          <TabsTrigger value="initiatives">المبادرات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab stats={stats} />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationsTab canManageOrganizations={canManageOrganizations} />
        </TabsContent>

        <TabsContent value="initiatives">
          <InitiativesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
