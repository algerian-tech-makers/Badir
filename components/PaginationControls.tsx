"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
  className?: string;
  dir?: "ltr" | "rtl";
}

/**
 * Pagination controls for navigating through pages of content.
 * Displays page numbers, next/previous buttons, and handles page changes.
 *
 * @param currentPage - The current active page number.
 * @param totalPages - The total number of pages available.
 * @param hasNext - Whether there is a next page.
 * @param hasPrev - Whether there is a previous page.
 * @param onPageChange - Callback function to handle page changes.
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
  className,
}: PaginationControlsProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | "ellipsis")[] = [];

    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }

    // Calculate range around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      pages.push("ellipsis");
    }

    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      pages.push("ellipsis");
    }

    // Always show last page (if different from first)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex justify-center", className)}>
      <Pagination>
        <PaginationContent className="flex items-center gap-1">
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => hasPrev && onPageChange(currentPage - 1)}
              className={cn(
                "cursor-pointer",
                !hasPrev && "pointer-events-none cursor-not-allowed opacity-50",
              )}
              text="السابق"
            />
          </PaginationItem>

          {/* Page Numbers */}
          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              onClick={() => hasNext && onPageChange(currentPage + 1)}
              className={cn(
                "cursor-pointer",
                !hasNext && "pointer-events-none cursor-not-allowed opacity-50",
              )}
              text="التالي"
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
