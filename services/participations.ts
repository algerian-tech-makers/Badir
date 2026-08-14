import { prisma } from "@/lib/db";
import { PaginatedResponse, PaginationParams } from "@/types/Pagination";
import {
  Initiative,
  InitiativeCategory,
  InitiativeParticipant,
  InitiativeStatus,
  Organization,
  OrganizerType,
  ParticipantRole,
  ParticipationStatus,
  Prisma,
  TargetAudience,
  User,
  UserInitiativeRating,
} from "@prisma/client";

export type UserParticipation = {
  type: "participant" | "organizer";
  participantRole: ParticipantRole;
  status: ParticipationStatus;
  initiative: Initiative & {
    category: InitiativeCategory;
    organizerUser?: User | null;
    organizerOrg?: Organization | null;
  };
  rating: UserInitiativeRating | null;
  avgRating: number | null;
};

export type JoinedParticipationFilters = {
  search?: string;
  categoryId?: string;
  targetAudience?: TargetAudience;
  organizerType?: OrganizerType;
  initiativeStatus?: InitiativeStatus | "ongoing" | "completed";
  status?: ParticipationStatus;
};

export class ParticipationService {
  static API_PATH = "/participations";

  static async getJoinedParticipations(
    userId: string,
    filters: JoinedParticipationFilters = {},
    pagination: PaginationParams = { page: 1, limit: 12 },
  ): Promise<PaginatedResponse<UserParticipation>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.InitiativeParticipantWhereInput = { userId };
    const initiativeWhere: Prisma.InitiativeWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.categoryId) {
      initiativeWhere.categoryId = filters.categoryId;
    }

    if (filters.targetAudience) {
      initiativeWhere.targetAudience =
        filters.targetAudience !== TargetAudience.both
          ? { in: [filters.targetAudience, TargetAudience.both] }
          : undefined;
    }

    if (filters.organizerType) {
      initiativeWhere.organizerType = filters.organizerType;
    }

    if (filters.initiativeStatus) {
      const now = new Date();
      if (filters.initiativeStatus === "ongoing") {
        initiativeWhere.startDate = { lte: now };
        initiativeWhere.endDate = { gte: now };
        initiativeWhere.status = InitiativeStatus.published;
      } else if (filters.initiativeStatus === "completed") {
        initiativeWhere.endDate = { lt: now };
        initiativeWhere.status = InitiativeStatus.published;
      } else {
        initiativeWhere.status = filters.initiativeStatus;
      }
    }

    if (Object.keys(initiativeWhere).length > 0) {
      where.initiative = initiativeWhere;
    }

    if (filters.search) {
      where.OR = [
        {
          initiative: {
            titleAr: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          initiative: {
            titleEn: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          initiative: {
            shortDescriptionAr: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
        {
          initiative: {
            shortDescriptionEn: {
              contains: filters.search,
              mode: "insensitive",
            },
          },
        },
        {
          initiative: {
            city: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          initiative: {
            category: {
              nameAr: { contains: filters.search, mode: "insensitive" },
            },
          },
        },
        {
          initiative: {
            category: {
              nameEn: { contains: filters.search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const total = await prisma.initiativeParticipant.count({ where });

    const participations = await prisma.initiativeParticipant.findMany({
      where,
      include: {
        initiative: {
          include: {
            category: true,
            organizerUser: true,
            organizerOrg: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      skip,
      take: limit,
    });

    const initiativeIds = participations.map((p) => p.initiativeId);

    const ratings = await prisma.userInitiativeRating.findMany({
      where: {
        userId,
        initiativeId: { in: initiativeIds },
      },
    });

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

    const data: UserParticipation[] = participations.map((p) => ({
      type: "participant",
      participantRole: p.participantRole,
      status: p.status,
      initiative: p.initiative,
      rating: ratings.find((r) => r.initiativeId === p.initiativeId) || null,
      avgRating:
        Number(
          ratingAverages.find((r) => r.initiativeId === p.initiativeId)?._avg
            .rating,
        ) || null,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  static async getUserParticipations(
    userId: string,
    isOwner: boolean = false,
  ): Promise<UserParticipation[]> {
    // Participations as participant
    const participations = await prisma.initiativeParticipant.findMany({
      where: {
        userId,
        status: isOwner ? undefined : { not: ParticipationStatus.rejected },
      },
      include: {
        initiative: {
          include: {
            category: true,
            organizerUser: true,
            organizerOrg: true,
          },
        },
      },
    });

    // Initiatives organized by the user (always manager)
    const organizedInitiatives = await prisma.initiative.findMany({
      where: {
        organizerUserId: userId,
      },
      include: {
        category: true,
        organizerUser: true,
        organizerOrg: true,
      },
    });

    // get user ratings for all relevant initiatives
    const initiativeIds = [
      ...participations.map((p) => p.initiativeId),
      ...organizedInitiatives.map((i) => i.id),
    ];
    const ratings = await prisma.userInitiativeRating.findMany({
      where: {
        userId,
        initiativeId: { in: initiativeIds },
      },
    });

    // get average ratings for all relevant initiatives
    const participantInitiativeIds = participations.map((p) => p.initiativeId);
    const organizedInitiativeIds = organizedInitiatives.map((i) => i.id);
    const allInitiativeIds = [
      ...new Set([...participantInitiativeIds, ...organizedInitiativeIds]),
    ];
    const ratingAverages = await prisma.userInitiativeRating.groupBy({
      by: ["initiativeId"],
      _avg: {
        rating: true,
      },
      where: {
        initiativeId: {
          in: allInitiativeIds,
        },
      },
    });

    // Merge everything
    const participationsData = participations.map((p) => {
      const avgRatingData = ratingAverages.find(
        (r) => r.initiativeId === p.initiativeId,
      );
      return {
        type: "participant" as const,
        participantRole: p.participantRole,
        status: p.status,
        initiative: p.initiative,
        rating: ratings.find((r) => r.initiativeId === p.initiativeId) || null,
        avgRating: Number(avgRatingData?._avg.rating) || null,
      };
    });

    const organizedData = organizedInitiatives.map((i) => {
      const avgRatingData = ratingAverages.find((r) => r.initiativeId === i.id);
      return {
        type: "organizer" as const,
        participantRole: ParticipantRole.manager,
        status: ParticipationStatus.approved,
        initiative: i,
        rating: ratings.find((r) => r.initiativeId === i.id) || null,
        avgRating: Number(avgRatingData?._avg.rating) || null,
      };
    });

    return [...participationsData, ...organizedData];
  }

  static async getAll(): Promise<InitiativeParticipant[]> {
    return await prisma.initiativeParticipant.findMany({
      include: {
        initiative: {
          include: {
            category: true,
            organizerUser: true,
            organizerOrg: true,
          },
        },
      },
    });
  }

  static async getByIds(
    userId: string,
    initiativeId: string,
  ): Promise<InitiativeParticipant | null> {
    return await prisma.initiativeParticipant.findFirst({
      where: {
        initiativeId: initiativeId,
        userId: userId,
      },
    });
  }

  /**
   *  Create a new initiative participation record
   * @param {string} initiativeId
   * @param {string} userId
   * @param {ParticipantRole} role
   * @param {ParticipationStatus} status
   * @param {Record<string, string | string[]> | undefined} sanitizedFormResponses
   * @returns {Promise<InitiativeParticipant>}
   */
  static async createParticipant(
    initiativeId: string,
    userId: string,
    role: ParticipantRole,
    status: ParticipationStatus,
    sanitizedFormResponses?: Record<string, string | string[]>,
  ): Promise<InitiativeParticipant> {
    return await prisma.initiativeParticipant.create({
      data: {
        initiativeId: initiativeId,
        userId: userId,
        participantRole: role,
        participationForm: sanitizedFormResponses,
        status: status,
      },
    });
  }
}
