"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { AdminService, AdminUserCard } from "@/services/admin";
import { assignManager, revokeManager } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationControls from "@/components/PaginationControls";
import { formatDate } from "@/lib/utils";
import FilterSelect from "@/components/FilterSelect";
import { UserRole } from "@prisma/client";

interface UserManagementTableProps {
  initialData: Awaited<ReturnType<typeof AdminService.getUsers>>;
  viewerRole: UserRole;
}

const roleLabels = {
  USER: "USER",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;

function roleBadgeVariant(role: AdminUserCard["role"]) {
  if (role === "ADMIN") return "default";
  if (role === "MANAGER") return "secondary";
  return "outline";
}

export default function UserManagementTable({
  initialData,
  viewerRole,
}: UserManagementTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  const currentRole = searchParams.get("role") ?? "all";

  useEffect(() => {
    setSearchValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextQuery = searchValue.trim();
      const currentQuery = searchParams.get("q") ?? "";

      if (nextQuery === currentQuery) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (nextQuery) {
        params.set("q", nextQuery);
      } else {
        params.delete("q");
      }

      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350); // Debounce the search input to avoid excessive updates

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchParams, searchValue]);

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRoleChange = (nextRole: string | null) => {
    if (nextRole === null) return;
    updateQuery({ role: nextRole === "all" ? undefined : nextRole });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleAssign = (user: AdminUserCard) => {
    setPendingUserId(user.id);
    startTransition(() => {
      void (async () => {
        try {
          const result = await assignManager(user.id);

          if (result.success) {
            toast.success(result.message || "تم تحديث دور المستخدم بنجاح");
            router.refresh();
          } else {
            toast.error(result.error || "حدث خطأ أثناء تحديث الدور");
          }
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحديث الدور",
          );
        } finally {
          setPendingUserId(null);
        }
      })();
    });
  };

  const handleRevoke = (user: AdminUserCard) => {
    setPendingUserId(user.id);
    startTransition(() => {
      void (async () => {
        try {
          const result = await revokeManager(user.id);

          if (result.success) {
            toast.success(result.message || "تم تحديث دور المستخدم بنجاح");
            router.refresh();
          } else {
            toast.error(result.error || "حدث خطأ أثناء تحديث الدور");
          }
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحديث الدور",
          );
        } finally {
          setPendingUserId(null);
        }
      })();
    });
  };

  const users = initialData.data;
  const pagination = initialData.pagination;
  const canManageManagers = viewerRole === "ADMIN";

  return (
    <div className="mx-auto max-w-7xl p-6" dir="rtl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          إدارة المستخدمين
        </h1>
        <p className="text-gray-600">تعيين وإلغاء صلاحيات المدير للمستخدمين</p>
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              البحث
            </span>
            <div className="relative">
              <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="البحث بالاسم أو البريد الإلكتروني"
                className="h-9 rounded-xl border-gray-200 bg-white pr-10 pl-4"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              الدور
            </span>
            <FilterSelect
              value={currentRole}
              onChange={handleRoleChange}
              options={[
                { value: "all", label: "كل الأدوار" },
                { value: "USER", label: "مستخدم" },
                { value: "MANAGER", label: "مدير" },
                { value: "ADMIN", label: "مسؤول" },
              ]}
              placeholder="جميع الأدوار"
            />
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">الاسم</TableHead>
              <TableHead className="w-1/4">البريد الإلكتروني</TableHead>
              <TableHead className="w-32">الدور</TableHead>
              <TableHead className="w-44">تاريخ الانضمام</TableHead>
              <TableHead className="text-left">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-gray-500"
                >
                  لا توجد نتائج مطابقة
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isRowPending = pendingUserId === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-gray-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(user.role)}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {canManageManagers && user.role === "USER" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending || isRowPending}
                            onClick={() => handleAssign(user)}
                          >
                            {isRowPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Make Manager"
                            )}
                          </Button>
                        )}

                        {canManageManagers && user.role === "MANAGER" && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isPending || isRowPending}
                            onClick={() => handleRevoke(user)}
                          >
                            {isRowPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Revoke Manager"
                            )}
                          </Button>
                        )}

                        {(user.role === "ADMIN" || !canManageManagers) && (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div className="text-sm text-gray-600">
          إجمالي المستخدمين:{" "}
          <span className="font-medium text-gray-900">{pagination.total}</span>
        </div>
        <PaginationControls
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
