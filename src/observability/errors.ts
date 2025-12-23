import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logEvent } from "./logger";

const GENERIC_PUBLIC_MESSAGE = "مشکلی پیش آمده. لطفاً دوباره تلاش کنید.";
const VALIDATION_PUBLIC_MESSAGE = "ورودی نامعتبر است.";

export class AppError extends Error {
  status: number;
  publicMessage: string;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    options?: {
      status?: number;
      publicMessage?: string;
      code?: string;
      cause?: unknown;
      details?: Record<string, unknown>;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.status = options?.status ?? 500;
    this.publicMessage = options?.publicMessage ?? GENERIC_PUBLIC_MESSAGE;
    this.code = options?.code;
    this.details = options?.details;
    if (options?.cause) {
      (this as any).cause = options.cause;
    }
  }
}

export type NormalizedError = {
  status: number;
  publicMessage: string;
  code?: string;
  internalMessage: string;
  details?: Record<string, unknown>;
  stack?: string;
};

function normalizeZodError(error: ZodError): NormalizedError {
  return {
    status: 400,
    publicMessage: VALIDATION_PUBLIC_MESSAGE,
    code: "validation_error",
    internalMessage: error.message,
    details: {
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    },
  };
}

export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof AppError) {
    return {
      status: err.status,
      publicMessage: err.publicMessage,
      code: err.code,
      internalMessage: err.message,
      details: err.details,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    };
  }

  if (err instanceof ZodError) {
    return normalizeZodError(err);
  }

  if (err instanceof Error) {
    return {
      status: 500,
      publicMessage: GENERIC_PUBLIC_MESSAGE,
      code: "internal_error",
      internalMessage: err.message,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    };
  }

  return {
    status: 500,
    publicMessage: GENERIC_PUBLIC_MESSAGE,
    code: "unknown_error",
    internalMessage: String(err),
  };
}

export function respondWithError(err: unknown) {
  const normalized = normalizeError(err);
  logEvent("api.error", {
    status: normalized.status,
    code: normalized.code,
    internalMessage: normalized.internalMessage,
    error: process.env.NODE_ENV === "production" ? undefined : normalized.stack,
  });
  return NextResponse.json(
    { error: normalized.publicMessage, code: normalized.code },
    { status: normalized.status },
  );
}
