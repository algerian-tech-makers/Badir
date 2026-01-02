import { useState, useCallback, useEffect } from "react";
import { getOrganizationsAction } from "@/actions/admin";
import { AdminOrganizationCard } from "@/services/admin";
import { PaginatedResponse } from "@/types/Pagination";
import { toast } from "sonner";

interface OrganizationFilters {
  status: string;
  search: string;
  organizationType: string;
}

type PaginationData = PaginatedResponse<AdminOrganizationCard>["pagination"];

export function useAdminOrganizations(
  initialData?: PaginatedResponse<AdminOrganizationCard>,
) {
  const [organizations, setOrganizations] = useState<AdminOrganizationCard[]>(
    initialData?.data || [],
  );
  const [pagination, setPagination] = useState<PaginationData>(
    initialData?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  );
  const [filters, setFilters] = useState<OrganizationFilters>({
    status: "all",
    search: "",
    organizationType: "all",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchOrganizations = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiFilters: any = {};
        if (filters.status !== "all") apiFilters.status = filters.status;
        if (debouncedSearch) apiFilters.search = debouncedSearch;
        if (filters.organizationType && filters.organizationType !== "all")
          apiFilters.organizationType = filters.organizationType;

        const result = await getOrganizationsAction(
          apiFilters,
          page,
          pagination.limit,
        );

        if (result.success && result.data) {
          setOrganizations(result.data.data);
          setPagination(result.data.pagination);
        } else {
          toast.error(result.error || "حدث خطأ أثناء جلب المنظمات");
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error("حدث خطأ أثناء جلب المنظمات");
      } finally {
        setIsLoading(false);
      }
    },
    [
      pagination.limit,
      filters.status,
      filters.organizationType,
      debouncedSearch,
    ],
  );

  // Fetch when filters change
  useEffect(() => {
    fetchOrganizations(1);
  }, [
    filters.status,
    filters.organizationType,
    debouncedSearch,
    fetchOrganizations,
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchOrganizations(page);
    },
    [fetchOrganizations],
  );

  const handleFilterChange = useCallback(
    (key: keyof OrganizationFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const refetch = useCallback(() => {
    fetchOrganizations(pagination.page);
  }, [fetchOrganizations, pagination.page]);

  return {
    organizations,
    pagination,
    filters,
    isLoading,
    handlePageChange,
    handleFilterChange,
    refetch,
    setOrganizations,
  };
}
