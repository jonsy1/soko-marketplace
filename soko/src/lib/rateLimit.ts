import { prisma } from './prisma';

/**
 * Simple database-backed rate limiter. Works correctly across all
 * serverless instances (unlike in-memory counters) since it reads/writes
 * through Postgres.
 */
export async function checkRateLimit(identifier: string, maxAttempts: number, windowMinutes: number) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  const count = await prisma.loginAttempt.count({
    where: { identifier, createdAt: { gte: since } },
  });

  if (count >= maxAttempts) {
    return { allowed: false, retryAfterMinutes: windowMinutes };
  }
  return { allowed: true, retryAfterMinutes: 0 };
}

export async function recordAttempt(identifier: string) {
  await prisma.loginAttempt.create({ data: { identifier } });
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}