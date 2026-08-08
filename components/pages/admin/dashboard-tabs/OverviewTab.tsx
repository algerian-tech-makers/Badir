import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminService } from "@/services/admin";

type AdminStatsType = Awaited<ReturnType<typeof AdminService.getAdminStats>>;

interface OverviewTabProps {
  stats: AdminStatsType;
}

export const OverviewTab = ({ stats }: OverviewTabProps) => {
  return (
    <div className="space-y-6">
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
                <span className="font-medium">{stats.organizations.total}</span>
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
                <span className="font-medium">{stats.initiatives.total}</span>
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
    </div>
  );
};
