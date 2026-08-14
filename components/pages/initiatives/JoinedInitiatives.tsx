"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ParticipationService,
  UserParticipation,
} from "@/services/participations";
import { CategoryCard } from "@/services/categories";
import {
  organizerTypeOptions,
  participationStatusOptions,
  statusOptions,
  targetAudienceOptions,
} from "@/data/statics";
import InitiativeCard from "@/components/pages/InitiativeCard";
import SearchInput from "@/components/SearchInput";
import FilterSelect from "@/components/FilterSelect";
import PaginationControls from "@/components/PaginationControls";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import api from "@/services/api";
import { PaginatedResponse } from "@/types/Pagination";
import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import { ParticipationStatus } from "@prisma/client";

interface JoinedInitiativesProps {
  initialData: PaginatedResponse<UserParticipation>;
  categories: CategoryCard[];
}

interface JoinedFilters {
  categoryId?: string;
  targetAudience?: string;
  organizerType?: string;
  initiativeStatus?: string;
  status?: ParticipationStatus;
}

export default function JoinedInitiatives({
  initialData,
  categories,
}: JoinedInitiativesProps) {
  const [participations, setParticipations] =
    useState<PaginatedResponse<UserParticipation>>(initialData);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<JoinedFilters>({});
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  const categoryOptions = useMemo(() => {
    return [
      { value: "all", label: "جميع الفئات" },
      ...categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.nameAr,
      })),
    ];
  }, [categories]);

  const fetchJoined = async (
    newFilters: JoinedFilters,
    search?: string,
    page: number = 1,
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append("search", search);
      if (newFilters.categoryId)
        params.append("categoryId", newFilters.categoryId);
      if (newFilters.targetAudience)
        params.append("targetAudience", newFilters.targetAudience);
      if (newFilters.organizerType)
        params.append("organizerType", newFilters.organizerType);
      if (newFilters.initiativeStatus)
        params.append("initiativeStatus", newFilters.initiativeStatus);
      if (newFilters.status) params.append("status", newFilters.status);
      params.append("page", page.toString());
      params.append("limit", "12");

      const response = await api.get(
        `${ParticipationService.API_PATH}/joined?${params.toString()}`,
      );
      const data = response.data;

      if (data.success) {
        setParticipations(data.data);
      }
    } catch (error) {
      console.error("Error fetching joined initiatives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debouncedSearch === "" && Object.keys(filters).length === 0) {
      return;
    }

    fetchJoined(filters, debouncedSearch, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleFilterChange = (key: keyof JoinedFilters, value: string) => {
    const newFilters = { ...filters };

    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newFilters as any)[key] = value;
    }

    setFilters(newFilters);
    fetchJoined(newFilters, debouncedSearch, 1);
  };

  const handlePageChange = (page: number) => {
    fetchJoined(filters, debouncedSearch, page);
  };

  const handleClear = () => {
    setSearchValue("");
    setDebouncedSearch("");
    setFilters({});
    fetchJoined({}, "", 1);
  };

  const hasActiveFilters =
    searchValue !== "" || Object.keys(filters).length > 0;

  return (
    <div className="bg-neutrals-100 min-h-screen" dir="rtl">
      <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="w-24" />
          <h1 className="text-primary-md text-neutrals-700 font-bold">
            مبادراتي
          </h1>
          <BackButton url="/initiatives" label="مبادرات" />
        </div>

        {/* Filters Section */}
        <Card className="mb-8 border-none bg-transparent shadow-none">
          <CardContent className="p-4">
            {/* Search */}
            <div className="flex-center mb-4 max-w-full gap-4 max-sm:flex-wrap sm:justify-center">
              <SearchInput
                value={searchValue}
                onChange={setSearchValue}
                placeholder="ابحث في مبادراتك..."
                className="w-full"
              />
              <AppButton
                type="outline"
                border="rounded"
                size="sm"
                onClick={handleClear}
                disabled={!hasActiveFilters}
                icon={<X className="h-4 w-4" />}
              >
                مسح
              </AppButton>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Category Filter */}
              <FilterSelect
                value={filters.categoryId || "all"}
                onChange={(value) => handleFilterChange("categoryId", value)}
                options={categoryOptions}
                placeholder="فئة المبادرة"
              />

              {/* Target Audience Filter */}
              <FilterSelect
                value={filters.targetAudience || "both"}
                onChange={(value) =>
                  handleFilterChange("targetAudience", value)
                }
                options={targetAudienceOptions}
                placeholder="الجمهور المستهدف"
              />

              {/* Initiative Status Filter */}
              <FilterSelect
                value={filters.initiativeStatus || "all"}
                onChange={(value) =>
                  handleFilterChange("initiativeStatus", value)
                }
                options={statusOptions}
                placeholder="حالة المبادرة"
              />

              {/* Organizer Type Filter */}
              <FilterSelect
                value={filters.organizerType || "all"}
                onChange={(value) => handleFilterChange("organizerType", value)}
                options={organizerTypeOptions}
                placeholder="نوع المنظم"
              />

              {/* Participation Status Filter */}
              <FilterSelect
                value={filters.status || "all"}
                onChange={(value) => handleFilterChange("status", value)}
                options={participationStatusOptions}
                placeholder="حالة المشاركة"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-neutrals-600">
            <span className="font-medium">
              {participations.pagination.total}
            </span>{" "}
            {participations.data.length > 1 ? "مبادرات" : "مبادرة"}
            {participations.pagination.total > 0 && (
              <span className="mr-2">• من مشاركاتك</span>
            )}
          </div>

          {loading && (
            <div className="text-neutrals-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري التحميل...</span>
            </div>
          )}
        </div>

        {/* Initiatives Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {participations.data.map((participation) => (
            <div key={participation.initiative.id} className="h-full">
              <InitiativeCard
                mode="participation"
                participation={participation}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {participations.data.length === 0 && !loading && (
          <div className="py-12 text-center">
            <div className="mb-4">
              <div className="bg-neutrals-200 mx-auto flex h-24 w-24 items-center justify-center rounded-full">
                <span className="text-neutrals-400 text-2xl">🔍</span>
              </div>
            </div>
            <h3 className="text-neutrals-600 mb-2 text-xl font-semibold">
              لا توجد مبادرات
            </h3>
            <p className="text-neutrals-500">
              لم نتمكن من العثور على مبادرات تطابق المعايير المحددة
            </p>
          </div>
        )}

        {/* Pagination */}
        {participations.pagination.totalPages > 1 && (
          <PaginationControls
            currentPage={participations.pagination.page}
            totalPages={participations.pagination.totalPages}
            hasNext={participations.pagination.hasNext}
            hasPrev={participations.pagination.hasPrev}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}
