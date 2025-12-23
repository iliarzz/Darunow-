import type { NextRequest, NextResponse } from "next/server";
import { respondWithError } from "./errors";
import { logEvent } from "./logger";
import { withRequestContextFromRequest } from "./requestContext";

type Handler<TContext = unknown> = (
  req: NextRequest,
  ctx: TContext,
) => Promise<NextResponse> | NextResponse;

export function withApiContext<TContext = unknown>(
  handler: Handler<TContext>,
): Handler<TContext> {
  return (req: NextRequest, ctx: TContext) =>
    withRequestContextFromRequest(req, async () => {
      try {
        return await handler(req, ctx);
      } catch (error) {
        logEvent("api.unhandled_error", { path: req.nextUrl.pathname, method: req.method });
        return respondWithError(error);
      }
    });
}
