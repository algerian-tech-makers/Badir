import { useState, useCallback, useEffect } from "react";
import { getUserInitiativesAction } from "@/actions/admin";
import { AdminInitiativeCard } from "@/services/admin";
import { PaginatedResponse } from "@/types/Pagination";
import { toast } from "sonner";

interface InitiativeFilters {
  status: string;
  search: string;
  categoryId: string;
}

type PaginationData = PaginatedResponse<AdminInitiativeCard[]>["pagination"];

export function useAdminInitiatives(
  initialData?: PaginatedResponse<AdminInitiativeCard>,
) {
  const [initiatives, setInitiatives] = useState<AdminInitiativeCard[]>(
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
  const [filters, setFilters] = useState<InitiativeFilters>({
    status: "all",
    search: "",
    categoryId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchInitiatives = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiFilters: any = {};
        if (filters.status !== "all") apiFilters.status = filters.status;
        if (debouncedSearch) apiFilters.search = debouncedSearch;
        if (filters.categoryId && filters.categoryId !== "all")
          apiFilters.categoryId = filters.categoryId;

        const result = await getUserInitiativesAction(
          apiFilters,
          page,
          pagination.limit,
        );

        if (result.success && result.data) {
          setInitiatives(result.data.data);
          setPagination(result.data.pagination);
        } else {
          toast.error(result.error || "حدث خطأ أثناء جلب المبادرات");
        }
      } catch (error) {
        console.error("Error fetching initiatives:", error);
        toast.error("حدث خطأ أثناء جلب المبادرات");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit, filters.status, filters.categoryId, debouncedSearch],
  );

  // Fetch when filters change
  useEffect(() => {
    fetchInitiatives(1);
  }, [filters.status, filters.categoryId, debouncedSearch, fetchInitiatives]);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchInitiatives(page);
    },
    [fetchInitiatives],
  );

  const handleFilterChange = useCallback(
    (key: keyof InitiativeFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const refetch = useCallback(() => {
    fetchInitiatives(pagination.page);
  }, [fetchInitiatives]);

  return {
    initiatives,
    pagination,
    filters,
    isLoading,
    handlePageChange,
    handleFilterChange,
    refetch,
    setInitiatives,
  };
}
