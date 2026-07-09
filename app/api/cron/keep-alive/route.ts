import { NextRequest, NextResponse } from "next/server";
import { postCreationRateLimiter } from "@/lib/rate-limit";

/**
 * A crone job just to keep upstash Redis DB alive. We are on free plan
 * @param request
 * @returns
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await postCreationRateLimiter.limit("keep-alive-probe");
    await postCreationRateLimiter.resetUsedTokens("keep-alive-probe");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Keep-alive cron error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
