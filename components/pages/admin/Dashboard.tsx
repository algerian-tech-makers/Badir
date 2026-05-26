"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
  ArrowUpLeft,
  ArrowUpRight,
} from "lucide-react";
import {
  AdminOrganizationCard,
  AdminInitiativeCard,
  AdminService,
} from "@/services/admin";
import {
  AdminInitiativeStatusBadge,
  AdminOrganizationStatusBadge,
} from "../AdminStatusBadge";
import FilterSelect from "@/components/FilterSelect";
import SearchInput from "@/components/SearchInput";
import { organizationTypeOptions } from "@/types/Profile";
import { toast } from "sonner";
import Link from "next/link";
import AppButton from "@/components/AppButton";
import { InitiativeActions } from "./InitiativeActions";
import { useAdminInitiatives } from "@/hooks/useAdminInitiatives";
import { useAdminOrganizations } from "@/hooks/useAdminOrganizations";
import { updateOrganizationStatusAction } from "@/actions/admin";
import { formatDate } from "@/lib/utils";

type AdminStatsType = Awaited<ReturnType<typeof AdminService.getAdminStats>>;

interface AdminDashboardProps {
  initialStats?: AdminStatsType;
}

const AdminDashboard = ({ initialStats }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats] = useState<AdminStatsType>(
    initialStats || {
      organizations: { pending: 0, approved: 0, rejected: 0, total: 0 },
      initiatives: { draft: 0, published: 0, cancelled: 0, total: 0 },
    },
  );

  // Use custom hooks for organizations (limited to 3 for dashboard)
  const {
    organizations,
    filters: orgFilters,
    isLoading: orgLoading,
    handleFilterChange: handleOrgFilterChange,
    setOrganizations,
  } = useAdminOrganizations();

  const [selectedOrg, setSelectedOrg] = useState<AdminOrganizationCard | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showOrgDetailsDialog, setShowOrgDetailsDialog] = useState(false);
  const [showOrgRejectionDialog, setShowOrgRejectionDialog] = useState(false);

  // Use custom hooks for initiatives (limited to 3 for dashboard)
  const {
    initiatives,
    filters: initiativeFilters,
    isLoading: initLoading,
    handleFilterChange: handleInitiativeFilterChange,
    refetch: refetchInitiatives,
  } = useAdminInitiatives();

  const [selectedInitiative, setSelectedInitiative] =
    useState<AdminInitiativeCard | null>(null);

  const isLoading = orgLoading || initLoading;

  // Limit to 3 items for dashboard preview
  const displayOrganizations = organizations.slice(0, 3);
  const displayInitiatives = initiatives.slice(0, 3);

  const handleOrganizationStatusUpdate = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    if (status === "rejected" && !rejectionReason.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }

    try {
      startTransition(async () => {
        const result = await updateOrganizationStatusAction(
          id,
          status,
          status === "rejected" ? rejectionReason : undefined,
        );

        if (result.success) {
          setOrganizations((prev) =>
            prev.map((org) =>
              org.id === id
                ? { ...org, status: status as "approved" | "rejected" }
                : org,
            ),
          );
          setSelectedOrg((prev) =>
            prev && prev.id === id
              ? { ...prev, status: status as "approved" | "rejected" }
              : prev,
          );
          toast.success("تم تحديث حالة المنظمة بنجاح");
          setShowOrgDetailsDialog(false);
          setShowOrgRejectionDialog(false);
          setRejectionReason("");
        } else {
          toast.error(result.error || "حدث خطأ أثناء تحديث حالة المنظمة");
        }
      });
    } catch {
      toast.error("حدث خطأ أثناء تحديث الحالة");
    }
  };

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

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  المنظمات قيد المراجعة
                </CardTitle>
                <Clock className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.organizations.pending}
                </div>
                <p className="text-muted-foreground text-xs">تحتاج لمراجعة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  المنظمات المقبولة
                </CardTitle>
                <CheckCircle className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.organizations.approved}
                </div>
                <p className="text-muted-foreground text-xs">تم قبولها</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  المبادرات قيد المراجعة
                </CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.initiatives.draft}
                </div>
                <p className="text-muted-foreground text-xs">تحتاج لمراجعة</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  المبادرات المنشورة
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.initiatives.published}
                </div>
                <p className="text-muted-foreground text-xs">تم نشرها</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  إحصائيات المنظمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">المجموع</span>
                    <span className="font-medium">
                      {stats.organizations.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">قيد المراجعة</span>
                    <span className="font-medium text-orange-600">
                      {stats.organizations.pending}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">مقبولة</span>
                    <span className="font-medium text-green-600">
                      {stats.organizations.approved}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">مرفوضة</span>
                    <span className="font-medium text-red-600">
                      {stats.organizations.rejected}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  إحصائيات المبادرات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">المجموع</span>
                    <span className="font-medium">
                      {stats.initiatives.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">مسودات</span>
                    <span className="font-medium text-blue-600">
                      {stats.initiatives.draft}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">منشورة</span>
                    <span className="font-medium text-green-600">
                      {stats.initiatives.published}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">ملغية</span>
                    <span className="font-medium text-red-600">
                      {stats.initiatives.cancelled}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6" dir="rtl">
          <div className="mt-6 mb-6 flex w-full items-end gap-4">
            <div className="min-w-0 flex-1">
              <SearchInput
                value={orgFilters.search}
                onChange={(value) => handleOrgFilterChange("search", value)}
                placeholder="البحث عن منظمة..."
                className="w-full"
              />
            </div>
            {/* Filters */}
            <div className="grid shrink-0 grid-cols-2 gap-4" dir="rtl">
              <FilterSelect
                value={orgFilters.status}
                onChange={(value) => handleOrgFilterChange("status", value)}
                options={[
                  { value: "all", label: "جميع الحالات" },
                  { value: "pending", label: "قيد المراجعة" },
                  { value: "approved", label: "مقبولة" },
                  { value: "rejected", label: "مرفوضة" },
                ]}
                placeholder="الحالة"
                className="w-40"
              />

              <FilterSelect
                value={orgFilters.organizationType}
                onChange={(value) =>
                  handleOrgFilterChange("organizationType", value)
                }
                options={[
                  ...organizationTypeOptions,
                  { value: "all", label: "جميع الأنواع" },
                ]}
                placeholder="النوع"
                className="w-40"
              />
            </div>
          </div>

          {/* Organizations List */}
          <div className="space-y-4">
            {isLoading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-500" />
            ) : displayOrganizations.length > 0 ? (
              <>
                {displayOrganizations.map((org) => (
                  <Card key={org.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/organizations/${org.id}`}
                            target="_blank"
                            className="flex items-center"
                          >
                            <ArrowUpRight className="ml-1 inline-block h-4 w-4 text-gray-500" />
                            <h3 className="text-lg font-semibold text-gray-900 hover:underline">
                              {org.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-600">
                            {org.shortName}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {org.contactEmail}
                            </span>
                            {org.contactPhone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                <span dir="ltr">{org.contactPhone}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {org.city}, {org.country}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <AdminOrganizationStatusBadge status={org.status} />
                          <span className="text-sm text-gray-500">
                            {org._count.initiatives} مبادرة
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">المالك:</span>{" "}
                          {org.owner.name} ({org.owner.email})
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrg(org);
                              setShowOrgDetailsDialog(true);
                            }}
                          >
                            <Eye className="ml-1 h-4 w-4" />
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="w-full" dir="rtl">
                  <AppButton
                    type="outline"
                    url="/admin/organizations"
                    className="mx-auto"
                    border="default"
                    icon={<ArrowUpLeft className="ml-1 h-4 w-4" />}
                  >
                    عرض المزيد
                  </AppButton>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">لا توجد منظمات لعرضها</p>
            )}
          </div>

          <Dialog
            open={showOrgDetailsDialog}
            onOpenChange={setShowOrgDetailsDialog}
          >
            <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تفاصيل المنظمة - {selectedOrg?.name}</DialogTitle>
                <DialogDescription>
                  عرض كامل المعلومات والتفاصيل الخاصة بالمنظمة
                </DialogDescription>
              </DialogHeader>
              {selectedOrg && (
                <div className="space-y-6" dir="rtl">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium text-gray-700">
                        اسم المنظمة:
                      </Label>
                      <p className="mt-1">{selectedOrg.name}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">
                        الاسم المختصر:
                      </Label>
                      <p className="mt-1">
                        {selectedOrg.shortName || "غير متوفر"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">
                        نوع المنظمة:
                      </Label>
                      <p className="mt-1">{selectedOrg.organizationType}</p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">
                        عدد الأعضاء:
                      </Label>
                      <p className="mt-1">
                        {selectedOrg.membersCount || "غير محدد"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">
                        تاريخ التأسيس:
                      </Label>
                      <p className="mt-1">
                        {selectedOrg.foundingDate
                          ? formatDate(selectedOrg.foundingDate)
                          : "غير متوفر"}
                      </p>
                    </div>
                    <div>
                      <Label className="font-medium text-gray-700">
                        المقر الرئيسي:
                      </Label>
                      <p className="mt-1">
                        {selectedOrg.headquarters || "غير متوفر"}
                      </p>
                    </div>
                  </div>

                  {selectedOrg.description && (
                    <div>
                      <Label className="font-medium text-gray-700">
                        وصف المنظمة:
                      </Label>
                      <p className="mt-1 rounded-lg bg-gray-50 p-3">
                        {selectedOrg.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <Label className="font-medium text-gray-700">
                      مجالات العمل:
                    </Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedOrg.workAreas.map((area, index) => (
                        <Badge key={index} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <Label className="mb-3 block font-medium text-gray-700">
                      معلومات التواصل:
                    </Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedOrg.contactEmail}
                      </span>
                    </div>
                    {selectedOrg.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm" dir="ltr">
                          {selectedOrg.contactPhone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedOrg.city}, {selectedOrg.state},{" "}
                        {selectedOrg.country}
                      </span>
                    </div>
                    {selectedOrg.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🌐</span>
                        <a
                          href={selectedOrg.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {selectedOrg.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <Label className="mb-3 block font-medium text-gray-700">
                      معلومات المالك:
                    </Label>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <strong>الاسم:</strong> {selectedOrg.owner.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <strong>البريد:</strong> {selectedOrg.owner.email}
                      </p>
                      {selectedOrg.owner.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <strong>الهاتف:</strong>{" "}
                          <span dir="ltr">{selectedOrg.owner.phone}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <strong>تاريخ التسجيل:</strong>{" "}
                        {formatDate(selectedOrg.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 pt-4">
                    {selectedOrg.status === "pending" && (
                      <>
                        <Button
                          onClick={() =>
                            handleOrganizationStatusUpdate(
                              selectedOrg.id,
                              "approved",
                            )
                          }
                          disabled={isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="ml-1 h-4 w-4" />
                          قبول المنظمة
                        </Button>
                        <Button
                          onClick={() => {
                            setShowOrgDetailsDialog(false);
                            setShowOrgRejectionDialog(true);
                          }}
                          disabled={isPending}
                          variant="destructive"
                        >
                          <XCircle className="ml-1 h-4 w-4" />
                          رفض المنظمة
                        </Button>
                      </>
                    )}
                  </div>

                  {selectedOrg.status !== "pending" && (
                    <div className="border-t py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <AdminOrganizationStatusBadge
                          status={selectedOrg.status}
                        />
                        <span className="text-sm text-gray-600">
                          تم التحديث في {formatDate(selectedOrg.updatedAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={showOrgRejectionDialog}
            onOpenChange={setShowOrgRejectionDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>رفض المنظمة - {selectedOrg?.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4" dir="rtl">
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">
                    سبب رفض المنظمة <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="اكتب سبب رفض المنظمة..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setShowOrgRejectionDialog(false);
                      setRejectionReason("");
                    }}
                    variant="outline"
                    disabled={isPending}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedOrg) {
                        handleOrganizationStatusUpdate(
                          selectedOrg.id,
                          "rejected",
                        );
                      }
                    }}
                    disabled={isPending || !rejectionReason.trim()}
                    variant="destructive"
                  >
                    {isPending ? "جاري الرفض..." : "تأكيد الرفض"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Initiatives Tab */}
        <TabsContent value="initiatives" className="space-y-6" dir="rtl">
          <Alert className="mt-6" dir="rtl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              هذه الصفحة تعرض فقط المبادرات المنشأة من قبل المستخدمين العاديين
              والتي تحتاج لموافقة المسؤول قبل النشر.
            </AlertDescription>
          </Alert>

          {/* Filters */}
          <div className="mt-6 mb-6 flex w-full items-end gap-4">
            <div className="min-w-0 flex-1">
              <SearchInput
                value={initiativeFilters.search}
                onChange={(value) =>
                  handleInitiativeFilterChange("search", value)
                }
                placeholder="البحث عن مبادرة..."
                className="w-full"
              />
            </div>
            <FilterSelect
              value={initiativeFilters.status}
              onChange={(value) =>
                handleInitiativeFilterChange("status", value)
              }
              options={[
                { value: "all", label: "جميع الحالات" },
                { value: "draft", label: "مسودة" },
                { value: "published", label: "منشورة" },
                { value: "cancelled", label: "ملغية" },
              ]}
              placeholder="الحالة"
              className="w-40 shrink-0"
            />
          </div>

          {/* Initiatives List */}
          <div className="space-y-4">
            {isLoading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-500" />
            ) : displayInitiatives.length > 0 ? (
              <>
                {displayInitiatives.map((initiative) => (
                  <Card
                    key={initiative.id}
                    className="border-l-4 border-l-green-500"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/admin/initiatives/${initiative.id}`}
                            target="_blank"
                            className="flex items-center"
                          >
                            <ArrowUpRight className="ml-1 inline-block h-4 w-4 text-gray-500" />
                            <h3 className="text-lg font-semibold text-gray-900 hover:underline">
                              {initiative.titleAr}
                            </h3>
                          </Link>
                          {initiative.titleEn && (
                            <p className="text-sm text-gray-600">
                              {initiative.titleEn}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {initiative.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(
                                initiative.startDate,
                              ).toLocaleDateString("ar")}{" "}
                              -{" "}
                              {new Date(initiative.endDate).toLocaleDateString(
                                "ar",
                              )}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {initiative._count.participants} مشارك
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <AdminInitiativeStatusBadge
                            status={initiative.status}
                          />
                          <Badge variant="outline" className="text-xs">
                            {initiative.category.nameAr}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">المنظم:</span>{" "}
                          {initiative.organizerUser?.name || "غير محدد"} (
                          {initiative.organizerUser?.email || ""})
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedInitiative(initiative)
                                  }
                                >
                                  <Eye className="ml-1 h-4 w-4" />
                                  عرض التفاصيل
                                </Button>
                              }
                            ></DialogTrigger>
                            <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>تفاصيل المبادرة</DialogTitle>
                              </DialogHeader>
                              {selectedInitiative && (
                                <div className="space-y-4" dir="rtl">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="font-medium">
                                        عنوان المبادرة:
                                      </label>
                                      <p>{selectedInitiative.titleAr}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">
                                        العنوان بالإنجليزية:
                                      </label>
                                      <p>
                                        {selectedInitiative.titleEn ||
                                          "غير متوفر"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="font-medium">
                                        الفئة:
                                      </label>
                                      <p>
                                        {selectedInitiative.category.nameAr}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="font-medium">
                                        المدينة:
                                      </label>
                                      <p>{selectedInitiative.city}</p>
                                    </div>
                                    <div>
                                      <label className="font-medium">
                                        تاريخ البدء:
                                      </label>
                                      <p>
                                        {new Date(
                                          selectedInitiative.startDate,
                                        ).toLocaleDateString("ar")}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="font-medium">
                                        تاريخ الانتهاء:
                                      </label>
                                      <p>
                                        {new Date(
                                          selectedInitiative.endDate,
                                        ).toLocaleDateString("ar")}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="font-medium">
                                      معلومات المنظم:
                                    </label>
                                    <div className="mt-1 rounded bg-gray-50 p-3">
                                      <p>
                                        <strong>الاسم:</strong>{" "}
                                        {selectedInitiative.organizerUser
                                          ?.name || "غير محدد"}
                                      </p>
                                      <p>
                                        <strong>البريد:</strong>{" "}
                                        {selectedInitiative.organizerUser
                                          ?.email || "غير محدد"}
                                      </p>
                                    </div>
                                  </div>

                                  <InitiativeActions
                                    initiativeId={selectedInitiative.id}
                                    currentStatus={selectedInitiative.status}
                                    onStatusUpdate={refetchInitiatives}
                                  />
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="w-full" dir="rtl">
                  <AppButton
                    type="outline"
                    url="/admin/initiatives"
                    className="mx-auto"
                    border="default"
                    icon={<ArrowUpLeft className="ml-1 h-4 w-4" />}
                  >
                    عرض المزيد
                  </AppButton>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                لا توجد مبادرات لعرضها
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
