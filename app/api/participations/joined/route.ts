import { auth } from "@/lib/auth";
import {
  JoinedParticipationFilters,
  ParticipationService,
} from "@/services/participations";
import {
  OrganizerType,
  ParticipationStatus,
  TargetAudience,
} from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const filters: JoinedParticipationFilters = {};

    const search = searchParams.get("search");
    if (search) filters.search = search;

    const status = searchParams.get("status");
    if (
      status &&
      Object.values(ParticipationStatus).includes(status as ParticipationStatus)
    ) {
      filters.status = status as ParticipationStatus;
    }

    const categoryId = searchParams.get("categoryId");
    if (categoryId) filters.categoryId = categoryId;

    const targetAudience = searchParams.get("targetAudience");
    if (
      targetAudience &&
      Object.values(TargetAudience).includes(targetAudience as TargetAudience)
    ) {
      filters.targetAudience = targetAudience as TargetAudience;
    }

    const organizerType = searchParams.get("organizerType");
    if (
      organizerType &&
      Object.values(OrganizerType).includes(organizerType as OrganizerType)
    ) {
      filters.organizerType = organizerType as OrganizerType;
    }

    const initiativeStatus = searchParams.get("initiativeStatus");
    if (initiativeStatus) {
      filters.initiativeStatus =
        initiativeStatus as JoinedParticipationFilters["initiativeStatus"];
    }

    const result = await ParticipationService.getJoinedParticipations(
      session.user.id,
      filters,
      { page, limit },
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch participations",
      },
      { status: 500 },
    );
  }
}
