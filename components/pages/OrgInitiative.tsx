import { MapPin } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../ui/card";
import CategoryBadge from "./CategoryBadge";
import Ratings from "../Ratings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { InitiativeWithAvgRating } from "@/services/initiatives";
import Link from "next/link";

export default function OrgInitiative({
  initiative,
}: {
  initiative: InitiativeWithAvgRating;
}) {
  const {
    category,
    titleAr,
    startDate,
    endDate,
    city,
    avgRating,
    _count: { participants },
  } = initiative;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("ar-DZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card
      className="bg-neutrals-100 border-secondary-700 mx-auto h-full w-full max-w-2xl rounded-xl border-2 p-4 shadow-md md:p-6"
      dir="rtl"
    >
      <CardContent className="flex-center-column h-full justify-between gap-2 p-0">
        {/* Header with badges */}
        <div className="flex items-start justify-between gap-1">
          <CategoryBadge
            nameAr={category.nameAr}
            bgColor={category.bgColor ?? "transparent"}
            textColor={category.textColor ?? "inherit"}
          />
        </div>

        {/* Title and Date - Responsive Layout */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Title */}
          <Link href={`/initiatives/${initiative.id}`} className="flex-1">
            <h3 className="text-neutrals-700 flex-1 text-lg leading-tight font-bold hover:underline md:text-xl lg:text-2xl">
              {titleAr}
            </h3>
          </Link>

          {/* Date */}
          <div className="text-neutrals-700 lg:border-secondary-700 flex-wrap text-sm md:text-base lg:border-r-2 lg:pr-4">
            <span className="font-semibold">{formatDate(startDate)}</span>
            <span className="mx-2">إلى</span>
            <span className="font-semibold">{formatDate(endDate)}</span>
          </div>
        </div>

        {/* Location and participants */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-neutrals-500 text-sm md:text-base">
            المشاركون: {participants}
          </p>
        </div>

        {/* Organizer */}
        <div className="flex-center mt-2 w-full justify-between gap-4">
          <div className="text-neutrals-600 flex items-center gap-2 text-sm md:text-base">
            <div className="flex-center bg-primary-500 size-fit rounded-full p-0.5">
              <MapPin className="text-neutrals-100 h-5 w-5 md:h-5 md:w-5" />
            </div>
            <span>{city}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="cursor-pointer">
                    <Ratings
                      value={avgRating ?? 0}
                      readOnly
                      allowHalf
                      size="sm"
                    />
                  </div>
                }
              ></TooltipTrigger>
              <TooltipContent>
                {avgRating
                  ? `التقييم: ${avgRating} من 5`
                  : "هذه المبادرة ليس لها تقييم حتى الآن"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
