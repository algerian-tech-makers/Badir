"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useAdminUsers() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") ?? "");

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
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, router, searchParams, searchValue]);

  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
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
    },
    [pathname, router, searchParams],
  );

  const handleRoleChange = useCallback(
    (nextRole: string | null) => {
      if (nextRole === null) return;
      updateQuery({ role: nextRole === "all" ? undefined : nextRole });
    },
    [updateQuery],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  const currentRole = searchParams.get("role") ?? "all";

  return {
    searchValue,
    setSearchValue,
    currentRole,
    handleRoleChange,
    handlePageChange,
  };
}
