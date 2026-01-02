import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpLeft, Clock, Wifi, MapPin as MapPinIcon } from "lucide-react";
import { InitiativeCard as InitiativeCardType } from "@/services/initiatives";
import AppButton from "../AppButton";
import AvailabilityBadge from "./AvailabilityBadge";
import Image from "next/image";
import CategoryBadge from "./CategoryBadge";
import Link from "next/link";
import { OrganizerType } from "@prisma/client";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { formatDate } from "@/lib/utils";

export default function InitiativeCard({
  initiative,
  userId,
  className,
}: {
  initiative: InitiativeCardType;
  userId?: string;
  className?: string;
}) {
  const {
    id,
    category,
    titleAr,
    shortDescriptionAr,
    startDate,
    endDate,
    city,
    currentParticipants,
    maxParticipants,
    organizer,
    registrationDeadline,
  } = initiative;

  const now = new Date();
  const isDeadlinePassed = registrationDeadline && registrationDeadline < now;
  const isAvailable = !maxParticipants || currentParticipants < maxParticipants;
  const isOngoing = now >= new Date(startDate) && now <= new Date(endDate);
  const isCompleted = now > new Date(endDate);

  return (
    <Card
      className={`bg-neutrals-100 border-secondary-700 relative mx-auto h-full w-full max-w-2xl rounded-xl border-2 p-4 shadow-md md:p-6 ${className}`}
      dir="rtl"
    >
      <CardContent className="flex-center-column h-full justify-between gap-2 p-0.5">
        {registrationDeadline && (
          <TooltipProvider>
            <Tooltip>
              <TooltipContent>
                <p>الموعد النهائي للتسجيل</p>
                <p dir="rtl">{formatDate(registrationDeadline)}</p>
              </TooltipContent>
              <TooltipTrigger
                className="absolute top-1 right-1"
                aria-label="Show registration deadline"
              >
                <Clock className="text-neutrals-400 h-6 w-6" />
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        )}
        {/* Header with badges */}
        <div className="mt-2 flex flex-wrap items-start justify-between gap-2 sm:mt-1">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge
              nameAr={category.nameAr}
              bgColor={category.bgColor ?? "transparent"}
              textColor={category.textColor ?? "inherit"}
            />
            {/* Online/Onsite Badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                      initiative.isOnline
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {initiative.isOnline ? (
                      <>
                        <Wifi className="h-3 w-3" />
                        <span>عن بُعد</span>
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="h-3 w-3" />
                        <span>حضوري</span>
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {initiative.isOnline
                      ? "مبادرة عن بُعد - يمكن المشاركة من أي مكان"
                      : "مبادرة حضورية - تتطلب الحضور الفعلي"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <AvailabilityBadge
            initiativeStatus={initiative.status}
            isAvailable={isAvailable && !isDeadlinePassed}
            isOngoing={isOngoing}
            isCompleted={isCompleted}
            isCancelled={initiative.status === "cancelled"}
          />
        </div>

        {/* Title and Date - Responsive Layout */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* Title */}
          <h3 className="text-neutrals-700 flex-1 text-lg leading-tight font-bold md:text-xl lg:text-2xl">
            {titleAr}
          </h3>

          {/* Date */}
          <div className="text-neutrals-700 lg:border-secondary-700 flex-wrap text-sm md:text-base lg:border-r-2 lg:pr-4">
            <span className="font-semibold">{formatDate(startDate)}</span>
            <span className="mx-2">إلى</span>
            <span className="font-semibold">{formatDate(endDate)}</span>
          </div>
        </div>

        {/* Description */}
        {shortDescriptionAr && (
          <p className="text-neutrals-500 text-sm leading-relaxed md:text-base">
            {shortDescriptionAr}
          </p>
        )}

        {/* Location and participants */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-neutrals-600 flex items-center gap-2 text-sm md:text-base">
            <Image
              src="/images/icons/map-pin.svg"
              alt="عدد المشاركين"
              width={24}
              height={24}
            />
            <span>{city}</span>
          </div>

          <div className="text-neutrals-600 flex items-center gap-2 text-sm md:text-base">
            <Image
              src="/images/icons/group-reverse.svg"
              alt="عدد المشاركين"
              width={24}
              height={24}
            />
            <span className="truncate whitespace-nowrap">
              {maxParticipants
                ? `${currentParticipants} / ${maxParticipants} متطوع`
                : `${currentParticipants}`}
            </span>
          </div>
        </div>

        {/* Organizer */}
        <div className="text-neutrals-500 text-sm md:text-base">
          نُظِّمت بواسطة:{" "}
          <span className="text-neutrals-600 hover:text-primary-500 font-medium hover:underline">
            <Link
              href={
                organizer.id
                  ? organizer.type === OrganizerType.organization
                    ? `/organizations/${organizer.id}`
                    : `/profile/${organizer.id}`
                  : ``
              }
            >
              {organizer.name}
            </Link>
          </span>
        </div>

        {/* Action button */}
        <div className="flex justify-center justify-self-end pt-4">
          <AppButton
            type="outline"
            border="rounded"
            size="md"
            icon={<ArrowUpLeft />}
            className="w-full sm:w-auto"
            url={`/initiatives/${id}`}
            disabled={
              !isAvailable ||
              isCompleted ||
              !(
                (userId === organizer.id &&
                  initiative.status !== "cancelled") ||
                initiative.status === "published"
              )
            }
          >
            انضم للمبادرة
          </AppButton>
        </div>
      </CardContent>
    </Card>
  );
}
