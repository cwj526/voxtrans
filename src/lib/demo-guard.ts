import { AppError } from "@/lib/api-error";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

declare global {
  var __voxtransRateLimitStore: Map<string, RateLimitRecord> | undefined;
}

function getRateLimitStore(): Map<string, RateLimitRecord> {
  if (!globalThis.__voxtransRateLimitStore) {
    globalThis.__voxtransRateLimitStore = new Map();
  }
  return globalThis.__voxtransRateLimitStore;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const normalized = Math.floor(parsed);
  return normalized >= 0 ? normalized : fallback;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

function requireDemoAccessCode(request: Request): void {
  const requiredCode = process.env.DEMO_ACCESS_CODE?.trim();
  if (!requiredCode) {
    return;
  }

  const providedCode = request.headers.get("x-demo-access-code")?.trim();
  if (!providedCode) {
    throw new AppError("AUTH_DEMO_CODE_REQUIRED");
  }

  if (providedCode !== requiredCode) {
    throw new AppError("AUTH_DEMO_CODE_INVALID");
  }
}

function applyRateLimit(request: Request): void {
  const maxRequestsPerHour = parsePositiveInt(process.env.DEMO_MAX_REQUESTS_PER_HOUR, 30);
  if (maxRequestsPerHour <= 0) {
    return;
  }

  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const ip = getClientIp(request);
  const path = new URL(request.url).pathname;
  const bucketKey = `${ip}:${path}`;
  const store = getRateLimitStore();
  const current = store.get(bucketKey);

  if (!current || current.resetAt <= now) {
    store.set(bucketKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (current.count >= maxRequestsPerHour) {
    throw new AppError("RATE_LIMIT_EXCEEDED", undefined, {
      limit: maxRequestsPerHour,
      resetAt: new Date(current.resetAt).toISOString(),
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    });
  }

  current.count += 1;
  store.set(bucketKey, current);
}

export function guardDemoAccess(request: Request): void {
  requireDemoAccessCode(request);
  applyRateLimit(request);
}
