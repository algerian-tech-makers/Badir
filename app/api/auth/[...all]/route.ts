import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { signInRateLimiter, signUpRateLimiter } from "@/lib/rate-limit";

const { POST: authPOST, GET: authGET } = toNextJsHandler(auth);

const TOO_MANY_REQUESTS = new Response(
  JSON.stringify({ error: "طلبات كثيرة جداً" }),
  { status: 429, headers: { "Content-Type": "application/json" } },
);

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";

  if (pathname.endsWith("/sign-in/email")) {
    const { success } = await signInRateLimiter.limit(ip);
    if (!success) return TOO_MANY_REQUESTS.clone();
  } else if (pathname.endsWith("/sign-up/email")) {
    const { success } = await signUpRateLimiter.limit(ip);
    if (!success) return TOO_MANY_REQUESTS.clone();
  }

  return authPOST(request);
}

export const GET = authGET;
