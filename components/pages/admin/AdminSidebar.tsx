"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  Tag,
  Handshake,
} from "lucide-react";
import Logout from "@/components/Logout";
import { usePathname } from "next/navigation";
const navigation = [
  {
    name: "الإحصائيات",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "إدارة المنظمات",
    href: "/admin/organizations",
    icon: Building2,
  },
  {
    name: "إدارة المبادرات",
    href: "/admin/initiatives",
    icon: Users,
  },
  {
    name: "إدارة الفئات",
    href: "/admin/categories",
    icon: Tag,
  },
  {
    name: "إدارة الشركاء",
    href: "/admin/partners",
    icon: Handshake,
  },
];
const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <div
      className="flex w-64 flex-col border-l border-gray-200 bg-white shadow-md"
      style={{
        paddingBottom: "calc(var(--navbar-height))",
      }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900">لوحة تحكم المسؤول</h2>
        <p className="mt-1 text-sm text-gray-600">إدارة المنصة</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-gray-50",
                pathname === item.href
                  ? "bg-primary-50 text-primary-700 border-primary-200 border"
                  : "text-gray-700 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  pathname === item.href ? "text-primary-600" : "text-gray-500",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-2 border-t border-gray-200 p-4">
        <Link
          href="/initiatives"
          className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
        >
          <Home className="h-5 w-5 text-gray-500" />
          العودة للموقع
        </Link>
        <Logout />
      </div>
    </div>
  );
};

export default AdminSidebar;
