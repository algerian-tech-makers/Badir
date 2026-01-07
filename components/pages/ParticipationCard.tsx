import { AlertCircle, Clock, MapPin, XCircle } from "lucide-react";
import React from "react";
import { Card, CardContent } from "../ui/card";
import CategoryBadge from "./CategoryBadge";
import { UserParticipation } from "@/services/participations";
import { Badge } from "../ui/badge";
import { ParticipantRole, ParticipationStatus } from "@prisma/client";
import Ratings from "../Ratings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function ParticipationCard({
  participation,
  isInspecting = false,
}: {
  participation: UserParticipation;
  isInspecting?: boolean;
}) {
  const { participantRole, status, initiative, rating, avgRating } =
    participation;
  const {
    category,
    organizerOrg,
    organizerUser,
    titleAr,
    startDate,
    endDate,
    city,
  } = initiative;

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
          {status === ParticipationStatus.approved ? (
            <Badge className="bg-state-success text-secondary-700 rounded-full px-3 py-1 text-sm font-medium">
              {participantRole === ParticipantRole.manager
                ? "منظم"
                : participantRole === ParticipantRole.helper
                  ? "مساعد"
                  : "مشارك"}
            </Badge>
          ) : status === ParticipationStatus.registered ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-state-warning text-neutrals-700 size-7 rounded-full px-2 py-1">
                    <Clock className="h-6 w-6" />
                    <span className="sr-only">في انتظار الموافقة</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent className="h-max">
                  في انتظار الموافقة
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : status === ParticipationStatus.kicked ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="text-neutrals-300 bg-neutrals-700 size-7 rounded-full px-2 py-1">
                    <XCircle className="h-6 w-6" />
                    <span className="sr-only">تم طردك</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>تم طردك</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-state-error text-neutrals-700 size-7 rounded-full px-2 py-1">
                    <AlertCircle className="h-6 w-6" />
                    <span className="sr-only">{status}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{status}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
            نُظِّمت بواسطة:{" "}
            <span className="text-neutrals-600 font-medium">
              {organizerOrg
                ? organizerOrg.name
                : organizerUser?.firstName + " " + organizerUser?.lastName}
            </span>
          </p>
        </div>

        <div className="flex-center mt-2 w-full justify-between gap-4">
          <div className="text-neutrals-600 flex items-center gap-2 text-sm md:text-base">
            <div className="flex-center bg-primary-500 size-fit rounded-full p-0.5">
              <MapPin className="text-neutrals-100 h-5 w-5 md:h-5 md:w-5" />
            </div>
            <span>{city}</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">
                  <Ratings
                    value={rating?.rating ? Number(rating.rating) : 0}
                    readOnly
                    allowHalf
                    size="sm"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {!isInspecting ? (
                  <>
                    {rating?.rating
                      ? `تقييمك: ${rating.rating} من 5`
                      : "لم تقم بتقييم هذه المبادرة بعد"}
                  </>
                ) : (
                  <>
                    {avgRating
                      ? `تقييم: ${avgRating} من 5`
                      : "لم يقم أحد بتقييم هذه المبادرة بعد"}
                  </>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
