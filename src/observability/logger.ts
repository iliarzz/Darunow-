import pino from "pino";
import { getRequestContext } from "./requestContext";

type LogLevel = "debug" | "info" | "warn" | "error";

const sensitiveKeys = ["phone", "address", "token", "prescription", "fileurl", "file_url", "authorization", "cookie"];

const logger = pino({
  name: "darunow",
  level: process.env.LOG_LEVEL ?? "info",
  messageKey: "message",
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.authorization",
      "*.token",
      "*.session",
      "*.cookie",
      "*.phone",
      "*.address",
      "*.prescription",
      "*.fileUrl",
    ],
    censor: "[REDACTED]",
  },
});

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[truncated]";
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: process.env.NODE_ENV === "production" ? undefined : value.stack,
    };
  }
  if (Array.isArray(value)) {
    return value.map((v) => sanitize(v, depth + 1));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => {
      const lower = key.toLowerCase();
      if (sensitiveKeys.some((s) => lower.includes(s))) {
        return [key, "[REDACTED]"];
      }
      return [key, sanitize(val, depth + 1)];
    });
    return Object.fromEntries(entries);
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.includes("prescription") || lower.includes("bearer ") || lower.includes("token=")) {
      return "[REDACTED]";
    }
  }
  return value;
}

export function logEvent(
  name: string,
  props: Record<string, unknown> | undefined = undefined,
  level: LogLevel = "info",
) {
  const ctx = getRequestContext();
  const payload = sanitize(props ?? {}) as Record<string, unknown>;
  const base = {
    event: name,
    requestId: ctx?.requestId,
    actorType: ctx?.actorType,
    actorId: ctx?.actorId,
    orderId: ctx?.orderId,
    ...payload,
  };

  switch (level) {
    case "debug":
      logger.debug(base);
      break;
    case "warn":
      logger.warn(base);
      break;
    case "error":
      logger.error(base);
      break;
    default:
      logger.info(base);
  }
}

export function logError(
  err: unknown,
  props?: Record<string, unknown>,
  level: Extract<LogLevel, "error" | "warn"> = "error",
) {
  logEvent("error", { error: sanitize(err), ...props }, level);
}

export { logger };
