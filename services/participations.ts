import { prisma } from "@/lib/db";
import { sanitizePlainText } from "@/lib/santitize-server";
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

    const sanitizedSearch = filters.search
      ? sanitizePlainText(filters.search)
      : undefined;

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

    if (sanitizedSearch) {
      where.OR = [
        {
          initiative: {
            titleAr: { contains: sanitizedSearch, mode: "insensitive" },
          },
        },
        {
          initiative: {
            titleEn: { contains: sanitizedSearch, mode: "insensitive" },
          },
        },
        {
          initiative: {
            shortDescriptionAr: {
              contains: sanitizedSearch,
              mode: "insensitive",
            },
          },
        },
        {
          initiative: {
            shortDescriptionEn: {
              contains: sanitizedSearch,
              mode: "insensitive",
            },
          },
        },
        {
          initiative: {
            city: { contains: sanitizedSearch, mode: "insensitive" },
          },
        },
        {
          initiative: {
            category: {
              nameAr: { contains: sanitizedSearch, mode: "insensitive" },
            },
          },
        },
        {
          initiative: {
            category: {
              nameEn: { contains: sanitizedSearch, mode: "insensitive" },
            },
          },
        },
      ];
    }

    // Branch 2: initiatives created by the user directly
    const organizedByUserWhere: Prisma.InitiativeWhereInput = {
      organizerType: OrganizerType.user,
      organizerUserId: userId,
      ...initiativeWhere,
    };

    // Branch 3: initiatives created under the user's org
    const organizedByOrgWhere: Prisma.InitiativeWhereInput = {
      organizerType: OrganizerType.organization,
      organizerOrg: { userId },
      ...initiativeWhere,
    };

    const initiativeSearchOR = sanitizedSearch
      ? [
          {
            titleAr: {
              contains: sanitizedSearch,
              mode: "insensitive" as const,
            },
          },
          {
            titleEn: {
              contains: sanitizedSearch,
              mode: "insensitive" as const,
            },
          },
          {
            shortDescriptionAr: {
              contains: sanitizedSearch,
              mode: "insensitive" as const,
            },
          },
          {
            shortDescriptionEn: {
              contains: sanitizedSearch,
              mode: "insensitive" as const,
            },
          },
          { city: { contains: sanitizedSearch, mode: "insensitive" as const } },
          {
            category: {
              nameAr: {
                contains: sanitizedSearch,
                mode: "insensitive" as const,
              },
            },
          },
          {
            category: {
              nameEn: {
                contains: sanitizedSearch,
                mode: "insensitive" as const,
              },
            },
          },
        ]
      : null;

    if (initiativeSearchOR) {
      organizedByUserWhere.OR = initiativeSearchOR;
      organizedByOrgWhere.OR = initiativeSearchOR;
    }

    const [participantCount, organizedByUserCount, organizedByOrgCount] =
      await Promise.all([
        prisma.initiativeParticipant.count({ where }),
        prisma.initiative.count({ where: organizedByUserWhere }),
        prisma.initiative.count({ where: organizedByOrgWhere }),
      ]);

    const total = participantCount + organizedByUserCount + organizedByOrgCount;

    const participantSliceSize = Math.min(
      limit,
      Math.max(0, participantCount - skip),
    );

    const organizedByUserSkip = Math.max(0, skip - participantCount);
    const organizedByUserSliceSize = Math.min(
      limit - participantSliceSize,
      Math.max(0, organizedByUserCount - organizedByUserSkip),
    );

    const organizedByOrgSkip = Math.max(
      0,
      skip - participantCount - organizedByUserCount,
    );
    const organizedByOrgSliceSize =
      limit - participantSliceSize - organizedByUserSliceSize;

    const includeFields = {
      category: true,
      organizerUser: true,
      organizerOrg: true,
    };

    const [
      participations,
      organizedByUserInitiatives,
      organizedByOrgInitiatives,
    ] = await Promise.all([
      prisma.initiativeParticipant.findMany({
        where,
        include: { initiative: { include: includeFields } },
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: participantSliceSize,
      }),
      organizedByUserSliceSize > 0
        ? prisma.initiative.findMany({
            where: organizedByUserWhere,
            include: includeFields,
            orderBy: [{ createdAt: "desc" }],
            skip: organizedByUserSkip,
            take: organizedByUserSliceSize,
          })
        : Promise.resolve([]),
      organizedByOrgSliceSize > 0
        ? prisma.initiative.findMany({
            where: organizedByOrgWhere,
            include: includeFields,
            orderBy: [{ createdAt: "desc" }],
            skip: organizedByOrgSkip,
            take: organizedByOrgSliceSize,
          })
        : Promise.resolve([]),
    ]);

    const allInitiativeIds = [
      ...participations.map((p) => p.initiativeId),
      ...organizedByUserInitiatives.map((i) => i.id),
      ...organizedByOrgInitiatives.map((i) => i.id),
    ];

    const [ratings, ratingAverages] = await Promise.all([
      prisma.userInitiativeRating.findMany({
        where: { userId, initiativeId: { in: allInitiativeIds } },
      }),
      prisma.userInitiativeRating.groupBy({
        by: ["initiativeId"],
        _avg: { rating: true },
        where: { initiativeId: { in: allInitiativeIds } },
      }),
    ]);

    const toUserParticipation = (
      i: Initiative & {
        category: InitiativeCategory;
        organizerUser: User | null;
        organizerOrg: Organization | null;
      },
    ): UserParticipation => ({
      type: "organizer",
      participantRole: ParticipantRole.manager,
      status: ParticipationStatus.approved,
      initiative: i,
      rating: ratings.find((r) => r.initiativeId === i.id) || null,
      avgRating:
        Number(
          ratingAverages.find((r) => r.initiativeId === i.id)?._avg.rating,
        ) || null,
    });

    const participationsData: UserParticipation[] = participations.map((p) => ({
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
      data: [
        ...participationsData,
        ...organizedByUserInitiatives.map(toUserParticipation),
        ...organizedByOrgInitiatives.map(toUserParticipation),
      ],
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
