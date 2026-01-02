import { prisma } from "@/lib/db";
import { PaginatedResponse, PaginationParams } from "@/types/Pagination";
import {
  Prisma,
  InitiativeStatus,
  OrganizerType,
  TargetAudience,
} from "@prisma/client";

export interface InitiativeCard {
  id: string;
  titleAr: string;
  titleEn?: string | null;
  shortDescriptionAr?: string | null;
  shortDescriptionEn?: string | null;
  city: string;
  startDate: Date | string;
  endDate: Date | string;
  maxParticipants?: number | null;
  currentParticipants: number;
  targetAudience: TargetAudience;
  status: InitiativeStatus;
  registrationDeadline: Date | null;
  category: {
    nameAr: string;
    nameEn?: string | null;
    bgColor?: string | null;
    textColor?: string | null;
  };
  organizer: {
    id: string;
    type: OrganizerType;
    name: string;
    image?: string | null;
  };
  isOnline: boolean;
}

export interface InitiativeFilters {
  search?: string;
  categoryId?: string;
  city?: string;
  status?: InitiativeStatus | "ongoing" | "completed";
  targetAudience?: TargetAudience;
  organizerType?: OrganizerType;
  hasAvailableSpots?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
}

export interface InitiativeWithAvgRating extends Prisma.InitiativeGetPayload<{
  include: {
    category: true;
    organizerOrg: {
      select: {
        id: true;
        name: true;
        logo: true;
      };
    };
    _count: { select: { participants: true } };
  };
}> {
  avgRating: number | null;
}

export class InitiativeService {
  static API_PATH = "/initiatives";
  /**
   * Get paginated initiatives with filters
   * @param filters InitiativeFilters
   * @param pagination PaginationParams
   * @returns PaginatedResponse<InitiativeCard>
   */
  static async getMany(
    filters: InitiativeFilters = {},
    pagination: PaginationParams = { page: 1, limit: 12 },
  ): Promise<PaginatedResponse<InitiativeCard>> {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const now = new Date();

      // Build where clause based on filters
      const where: Prisma.InitiativeWhereInput = {};

      if (filters.status === "ongoing") {
        where.startDate = { lte: now };
        where.endDate = { gte: now };
        where.status = InitiativeStatus.published;
      } else if (filters.status === "completed") {
        where.endDate = { lt: now };
        where.status = InitiativeStatus.published;
      } else if (filters.status === InitiativeStatus.published) {
        where.status = { equals: filters.status };
      } else {
        where.status = { not: InitiativeStatus.draft };
      }

      // Search filter
      if (filters.search) {
        where.OR = [
          { titleAr: { contains: filters.search, mode: "insensitive" } },
          { titleEn: { contains: filters.search, mode: "insensitive" } },
          {
            shortDescriptionAr: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
          {
            shortDescriptionEn: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        ];
      }

      // Category filter
      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      // City filter
      if (filters.city) {
        where.city = { contains: filters.city, mode: "insensitive" };
      }

      // Target audience filter
      if (filters.targetAudience) {
        where.targetAudience =
          filters.targetAudience !== TargetAudience.both
            ? { in: [filters.targetAudience, TargetAudience.both] }
            : undefined;
      }

      // Organizer type filter
      if (filters.organizerType) {
        where.organizerType = filters.organizerType;
      }

      // Available spots filter
      if (filters.hasAvailableSpots) {
        const initiativesWithSpots = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "initiatives" 
          WHERE ("max_participants" IS NULL 
          OR "current_participants" < "max_participants")
          AND "end_date" >= NOW()
        `;

        const availableIds = initiativesWithSpots.map((item) => item.id);
        where.id = { in: availableIds };
      }

      // Date filters
      if (filters.startDateFrom || filters.startDateTo) {
        where.startDate = {};
        if (filters.startDateFrom) {
          where.startDate.gte = filters.startDateFrom;
        }
        if (filters.startDateTo) {
          where.startDate.lte = filters.startDateTo;
        }
      }

      if (filters.endDateFrom || filters.endDateTo) {
        where.endDate = {};
        if (filters.endDateFrom) {
          where.endDate.gte = filters.endDateFrom;
        }
        if (filters.endDateTo) {
          where.endDate.lte = filters.endDateTo;
        }
      }

      // Get total count for pagination
      const total = await prisma.initiative.count({ where });

      // Get initiatives with related data
      const initiatives = await prisma.initiative.findMany({
        where,
        include: {
          category: {
            select: {
              nameAr: true,
              nameEn: true,
              bgColor: true,
              textColor: true,
            },
          },
          organizerUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          organizerOrg: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
      });

      // Transform to InitiativeCard format
      const data: InitiativeCard[] = initiatives.map((initiative) => ({
        id: initiative.id.toString(),
        titleAr: initiative.titleAr,
        titleEn: initiative.titleEn,
        shortDescriptionAr: initiative.shortDescriptionAr,
        shortDescriptionEn: initiative.shortDescriptionEn,
        city: initiative.city,
        startDate: initiative.startDate,
        endDate: initiative.endDate,
        maxParticipants: initiative.maxParticipants,
        currentParticipants: initiative.currentParticipants,
        targetAudience: initiative.targetAudience,
        status: initiative.status,
        registrationDeadline: initiative.registrationDeadline,
        category: {
          nameAr: initiative.category.nameAr,
          nameEn: initiative.category.nameEn,
          bgColor: initiative.category.bgColor,
          textColor: initiative.category.textColor,
        },
        organizer: {
          id: initiative.organizerUserId
            ? initiative.organizerUserId
            : initiative.organizerOrgId
              ? initiative.organizerOrgId
              : "unknown",
          type: initiative.organizerType,
          name:
            initiative.organizerUser?.name ||
            initiative.organizerOrg?.name ||
            "غير محدد",
          image:
            initiative.organizerUser?.image || initiative.organizerOrg?.logo,
        },
        isOnline: initiative.isOnline,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching initiatives:", error);
      throw new Error("Failed to fetch initiatives");
    }
  }

  /**
   * Get single initiative by ID
   * @param id Initiative ID
   * @param userId User ID
   * @returns Initiative
   */
  static async getById(id: string, userId?: string) {
    try {
      const initiative = await prisma.initiative.findUnique({
        where: { id: id },
        include: {
          category: true,
          organizerUser: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          organizerOrg: {
            select: {
              id: true,
              name: true,
              logo: true,
              userId: true,
            },
          },
          participants: userId
            ? {
                select: {
                  id: true,
                  status: true,
                  participantRole: true,
                },
                where: {
                  userId: userId,
                },
              }
            : false,
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });

      return initiative;
    } catch (error) {
      console.error("Error fetching initiative:", error);
      throw new Error("Failed to fetch initiative");
    }
  }

  /**
   * Get all initiatives for a specific organization with their average ratings.
   * @param orgId Organization ID
   * @returns List of initiatives with average ratings
   */
  static async getOrgInitiativesWithAvgRating(
    orgId: string,
  ): Promise<InitiativeWithAvgRating[]> {
    try {
      const initiatives = await prisma.initiative.findMany({
        where: {
          organizerOrgId: orgId,
        },
        include: {
          category: true,
          organizerOrg: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }],
      });

      const initiativeIds = initiatives.map((i) => i.id);
      const ratingAverages = await prisma.userInitiativeRating.groupBy({
        by: ["initiativeId"],
        _avg: {
          rating: true,
        },
        where: {
          initiativeId: {
            in: initiativeIds,
          },
        },
      });

      const initiativesWithAvgRating = initiatives.map((initiative) => {
        const ratingData = ratingAverages.find(
          (r) => r.initiativeId === initiative.id,
        );
        return {
          ...initiative,
          avgRating: Number(ratingData?._avg.rating) ?? null,
        };
      });

      return initiativesWithAvgRating;
    } catch (error) {
      console.error("Error fetching organization initiatives:", error);
      throw new Error("Failed to fetch organization initiatives");
    }
  }

  /**
   * Update an initiative by ID
   * @param id Initiative ID
   * @param data Partial initiative fields to update
   * @returns The updated initiative object
   */
  static async updateById(
    id: string,
    data: Partial<Prisma.InitiativeUpdateInput>,
  ) {
    try {
      const updated = await prisma.initiative.update({
        where: { id },
        data,
        include: {
          category: true,
          organizerUser: {
            select: { id: true, name: true, image: true },
          },
          organizerOrg: {
            select: { id: true, name: true, logo: true },
          },
          _count: { select: { participants: true } },
        },
      });
      return updated;
    } catch (error) {
      console.error("Error updating initiative:", error);
      throw new Error("Failed to update initiative");
    }
  }

  /**
   * Get cover image path for an initiative
   * @param id Initiative ID
   * @returns Cover image path or null
   */
  static async getCoverImagePath(id: string) {
    const initiative = await prisma.initiative.findUnique({
      where: { id },
      select: { coverImage: true },
    });
    return initiative?.coverImage || null;
  }

  static async getInitiativesCount() {
    return await prisma.initiative.count();
  }
}
