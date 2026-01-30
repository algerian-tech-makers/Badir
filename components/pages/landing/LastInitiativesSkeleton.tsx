import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LastInitiativesSkeleton() {
  return (
    <section className="flex-center-column items-center" dir="rtl">
      <Skeleton className="mb-8 h-10 w-64" />
      <div className="mx-auto grid grid-cols-1 gap-6 p-6 max-xl:w-full sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <Card
            key={index}
            className="bg-neutrals-100 border-secondary-700 relative mx-auto h-full w-full max-w-2xl rounded-xl border-2 p-4 shadow-md sm:col-span-2 md:p-6 lg:col-span-1"
          >
            <CardContent className="flex-center-column h-full justify-between gap-2 p-0.5">
              {/* Badges */}
              <div className="mt-2 flex w-full flex-wrap items-start justify-between gap-2 sm:mt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>

              {/* Title and Description */}
              <div className="flex w-full flex-col gap-3">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>

              {/* Organizer */}
              <div className="flex w-full items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Date and Location */}
              <div className="flex w-full items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex w-full flex-col gap-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Button */}
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-12 w-48 rounded-lg" />
    </section>
  );
}
