// Best-effort client IP extraction for per-IP rate limiting. Shared by any
// unauthenticated (or optionally-authenticated) route that needs an abuse
// guard — e.g. /api/subscribe, /api/indexnow.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}
