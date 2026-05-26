import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { AUTHORIZED_REDIRECTION, forMiddleware } from "./data/routes";

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const sessionCookie = getSessionCookie(request);

  const isExactPublicRoute = forMiddleware.publicRoutes.includes(pathname);
  // /organizations/:id is public
  const isPublicOrgProfile =
    pathname.startsWith("/organizations/") && pathname !== "/organizations/";

  // /initiatives/:id is public (but NOT /initiatives/new or /initiatives/edit)
  const isPublicInitiativeDetail =
    pathname.startsWith("/initiatives/") &&
    pathname !== "/initiatives/" &&
    !pathname.startsWith("/initiatives/new") &&
    !pathname.includes("/edit");

  const isPublicRoute =
    isExactPublicRoute || isPublicOrgProfile || isPublicInitiativeDetail;

  const isAuthRoute = forMiddleware.authRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isApiRoute = new RegExp(
    `^(${[
      forMiddleware.api.authPrefix,
      forMiddleware.api.organizationPrefix,
      forMiddleware.api.initiativePrefix,
      forMiddleware.api.participantPrefix,
    ].join("|")})`,
  ).test(pathname);

  if (isApiRoute) return null;

  if (isAuthRoute) {
    // if (!session?.user.profileCompleted && pathname !== "/complete-profile") {
    //   return NextResponse.redirect(new URL("/complete-profile", request.url));
    // } ---> Moved it to component level validation
    if (sessionCookie) {
      return NextResponse.redirect(
        new URL(AUTHORIZED_REDIRECTION, request.url),
      );
    }
    return null;
  }

  // Redirect to login if not authenticated and not a public route
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|trpc|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|pdf|zip|webmanifest|sitemap)).*)",
  ],
};
