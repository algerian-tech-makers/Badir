import { prisma } from "@/lib/db";
import emailConfig from "@/lib/email";
import { PaginatedResponse, PaginationParams } from "@/types/Pagination";
import {
  Organization,
  OrganizationStatus,
  Initiative,
  InitiativeStatus,
  Prisma,
} from "@prisma/client";
import { Resend } from "resend";
import { render } from "@react-email/components";
import OrganizationStatusEmail from "@/emails/OrganizationStatusEmail";
import InitiativeStatusEmail from "@/emails/InitiativeStatusEmail";

export interface AdminOrganizationCard extends Organization {
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    isActive: boolean;
  };
  _count: {
    initiatives: number;
  };
}

export interface AdminInitiativeCard extends Initiative {
  category: {
    nameAr: string;
    nameEn?: string | null;
  };
  organizerUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count: {
    participants: number;
  };
}

export interface OrganizationFilters {
  status?: OrganizationStatus;
  search?: string;
  organizationType?: string;
  country?: string;
}

export interface InitiativeFilters {
  status?: InitiativeStatus;
  search?: string;
  categoryId?: string;
  city?: string;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export class AdminService {
  static API_PATH = "/admin";

  /**
   * Get paginated organizations for admin review
   */
  static async getOrganizations(
    filters: OrganizationFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResponse<AdminOrganizationCard>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {};

    // Status filter
    if (filters.status) {
      where.isVerified = filters.status;
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { shortName: { contains: filters.search, mode: "insensitive" } },
        { contactEmail: { contains: filters.search, mode: "insensitive" } },
        { owner: { name: { contains: filters.search, mode: "insensitive" } } },
        { owner: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    // Organization type filter
    if (filters.organizationType) {
      where.organizationType = filters.organizationType;
    }

    // Country filter
    if (filters.country) {
      where.country = filters.country;
    }

    const total = await prisma.organization.count({ where });

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            initiatives: true,
          },
        },
      },
      orderBy: [
        { isVerified: "asc" }, // Pending first
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: organizations as AdminOrganizationCard[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get user initiatives pending approval
   */
  static async getUserInitiatives(
    filters: InitiativeFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 },
  ): Promise<PaginatedResponse<AdminInitiativeCard>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.InitiativeWhereInput = {
      organizerType: "user", // only user initiatives need approval
    };

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        { titleAr: { contains: filters.search, mode: "insensitive" } },
        { titleEn: { contains: filters.search, mode: "insensitive" } },
        {
          organizerUser: {
            name: { contains: filters.search, mode: "insensitive" },
          },
        },
        {
          organizerUser: {
            email: { contains: filters.search, mode: "insensitive" },
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

    const total = await prisma.initiative.count({ where });

    const initiatives = await prisma.initiative.findMany({
      where,
      include: {
        category: {
          select: {
            nameAr: true,
            nameEn: true,
          },
        },
        organizerUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Draft first
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: initiatives as AdminInitiativeCard[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Approve or reject an organization
   */
  static async updateOrganizationStatus(
    organizationId: string,
    status: OrganizationStatus,
    _adminUserId: string,
    rejectionReason?: string,
  ) {
    try {
      const organization = await prisma.organization.update({
        where: { id: organizationId },
        data: {
          isVerified: status,
          updatedAt: new Date(),
        },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      const emailHtml = await render(
        OrganizationStatusEmail({
          organizationName: organization.name,
          ownerName: organization.owner.name,
          status: status === "approved" ? "approved" : "rejected",
          rejectionReason: status === "rejected" ? rejectionReason : undefined,
          dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://badir.space"}/profile`,
        }),
      );

      await resend.emails.send({
        from: emailConfig.fromEmail,
        to: `"${organization.owner.name}" <${organization.owner.email}>`,
        subject:
          status === "approved"
            ? `تم قبول منظمتك "${organization.name}" على منصة بادر 🎉`
            : `تحديث بخصوص طلب منظمتك "${organization.name}" على منصة بادر`,
        replyTo: emailConfig.contactEmail,
        html: emailHtml,
        headers: { "X-Entity-Ref-ID": `badir-org-status-${Date.now()}` },
        tags: [{ name: "category", value: "organization-status" }],
      });

      return {
        success: true,
        message:
          status === "approved" ? "تم قبول المنظمة بنجاح" : "تم رفض المنظمة",
        data: organization,
      };
    } catch (error) {
      console.error("Error updating organization status:", error);
      throw new Error("فشل في تحديث حالة المنظمة");
    }
  }

  /**
   * Approve or reject a user initiative
   */
  static async updateInitiativeStatus(
    initiativeId: string,
    status: InitiativeStatus,
    _adminUserId: string,
    rejectionReason?: string,
  ) {
    try {
      const initiative = await prisma.initiative.update({
        where: { id: initiativeId },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          organizerUser: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      if (initiative.organizerUser) {
        const emailHtml = await render(
          InitiativeStatusEmail({
            initiativeName: initiative.titleAr,
            organizerName: initiative.organizerUser.name,
            status: status === "published" ? "published" : "cancelled",
            rejectionReason:
              status === "cancelled" ? rejectionReason : undefined,
            initiativeLink: `${process.env.NEXT_PUBLIC_APP_URL || "https://badir.space"}/initiatives/${initiative.id}`,
          }),
        );

        await resend.emails.send({
          from: emailConfig.fromEmail,
          to: `"${initiative.organizerUser.name}" <${initiative.organizerUser.email}>`,
          subject:
            status === "published"
              ? `تم نشر مبادرتك "${initiative.titleAr}" على منصة بادر 🎉`
              : `تحديث بخصوص مبادرتك "${initiative.titleAr}" على منصة بادر`,
          replyTo: emailConfig.contactEmail,
          html: emailHtml,
          headers: {
            "X-Entity-Ref-ID": `badir-initiative-status-${Date.now()}`,
          },
          tags: [{ name: "category", value: "initiative-status" }],
        });
      }

      return {
        success: true,
        message:
          status === "published"
            ? "تم نشر المبادرة بنجاح"
            : "تم إلغاء المبادرة",
        data: initiative,
      };
    } catch (error) {
      console.error("Error updating initiative status:", error);
      throw new Error("فشل في تحديث حالة المبادرة");
    }
  }

  /**
   * Get organization by ID with full details for admin review
   */
  static async getOrganizationById(organizationId: string) {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            isActive: true,
          },
        },
        initiatives: {
          select: {
            id: true,
            titleAr: true,
            status: true,
            createdAt: true,
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            initiatives: true,
          },
        },
      },
    });
  }

  /**
   * Get initiative by ID with full details for admin review
   */
  static async getInitiativeById(initiativeId: string) {
    return await prisma.initiative.findUnique({
      where: { id: initiativeId },
      include: {
        category: true,
        organizerUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        participants: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            status: true,
            createdAt: true,
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
  }

  static async createInitiativeCategory(data: {
    nameAr: string;
    nameEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    bgColor?: string;
    textColor?: string;
    isActive?: boolean;
  }) {
    return await prisma.initiativeCategory.create({
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn || null,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        bgColor: data.bgColor || null,
        textColor: data.textColor || null,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async listInitiativeCategories() {
    return await prisma.initiativeCategory.findMany({
      orderBy: { nameAr: "asc" },
    });
  }

  static async updateInitiativeCategory(
    categoryId: string,
    data: {
      nameAr: string;
      nameEn?: string;
      descriptionAr?: string;
      descriptionEn?: string;
      bgColor?: string;
      textColor?: string;
      isActive?: boolean;
    },
  ) {
    return await prisma.initiativeCategory.update({
      where: { id: categoryId },
      data: {
        nameAr: data.nameAr,
        nameEn: data.nameEn || null,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        bgColor: data.bgColor || null,
        textColor: data.textColor || null,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async deleteInitiativeCategory(categoryId: string) {
    const associatedInitiatives = await prisma.initiative.count({
      where: { categoryId },
    });

    if (associatedInitiatives > 0) {
      throw new Error("لا يمكن حذف هذه الفئة لأنها مرتبطة بمبادرات حالية");
    }

    await prisma.initiativeCategory.delete({
      where: { id: categoryId },
    });

    return true;
  }

  /**
   * Get admin statistics
   */
  static async getAdminStats() {
    const [
      pendingOrgsCount,
      approvedOrgsCount,
      rejectedOrgsCount,
      draftInitiativesCount,
      publishedInitiativesCount,
      cancelledInitiativesCount,
    ] = await Promise.all([
      prisma.organization.count({ where: { isVerified: "pending" } }),
      prisma.organization.count({ where: { isVerified: "approved" } }),
      prisma.organization.count({ where: { isVerified: "rejected" } }),
      prisma.initiative.count({
        where: {
          status: "draft",
          organizerType: "user",
        },
      }),
      prisma.initiative.count({ where: { status: "published" } }),
      prisma.initiative.count({ where: { status: "cancelled" } }),
    ]);

    return {
      organizations: {
        pending: pendingOrgsCount,
        approved: approvedOrgsCount,
        rejected: rejectedOrgsCount,
        total: pendingOrgsCount + approvedOrgsCount + rejectedOrgsCount,
      },
      initiatives: {
        draft: draftInitiativesCount,
        published: publishedInitiativesCount,
        cancelled: cancelledInitiativesCount,
        total:
          draftInitiativesCount +
          publishedInitiativesCount +
          cancelledInitiativesCount,
      },
    };
  }

  /**
   * Get approved organizations for partner selection
   */
  static async getApprovedOrganizations(
    filters: { search?: string } = {},
    pagination: PaginationParams = { page: 1, limit: 20 },
  ): Promise<
    PaginatedResponse<{
      id: string;
      name: string;
      logo: string | null;
      isFeaturedPartner: boolean;
    }>
  > {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {
      isVerified: "approved",
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { shortName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [total, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        select: {
          id: true,
          name: true,
          logo: true,
          isFeaturedPartner: true,
        },
        orderBy: [{ isFeaturedPartner: "desc" }, { name: "asc" }],
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Toggle featured partner status for an organization
   */
  static async toggleFeaturedPartner(
    organizationId: string,
    isFeatured: boolean,
  ): Promise<void> {
    // If setting as featured, check if we already have 5 partners
    if (isFeatured) {
      const currentPartners = await prisma.organization.count({
        where: { isFeaturedPartner: true },
      });
      if (currentPartners >= 5) {
        throw new Error("لا يمكن إضافة أكثر من 5 شركاء مميزين");
      }
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { isFeaturedPartner: isFeatured },
    });
  }
}
