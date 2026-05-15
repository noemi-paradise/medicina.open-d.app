import crypto from "crypto";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashEmail(email: string): string {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

export function generateSignToken(casoId: number, compromisoId: number): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("CRON_SECRET no está configurado. Define esta variable de entorno.");
  }
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(`${casoId}:${compromisoId}`)
    .digest("hex")
    .slice(0, 16);
  const payload = Buffer.from(`${casoId}:${compromisoId}`).toString("base64url");
  return `${payload}.${hmac}`;
}

export function verifySignToken(token: string): { casoId: number; compromisoId: number } | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error("CRON_SECRET no está configurado. Define esta variable de entorno.");
  }
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const decoded = Buffer.from(parts[0], "base64url").toString("utf-8");
    const [casoIdStr, compromisoIdStr] = decoded.split(":");
    const casoId = parseInt(casoIdStr, 10);
    const compromisoId = parseInt(compromisoIdStr, 10);
    if (isNaN(casoId) || isNaN(compromisoId)) return null;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${casoId}:${compromisoId}`)
      .digest("hex")
      .slice(0, 16);

    if (!crypto.timingSafeEqual(Buffer.from(parts[1]), Buffer.from(expected))) {
      return null;
    }

    return { casoId, compromisoId };
  } catch {
    return null;
  }
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "127.0.0.1";
}

export function sanitizeName(name: string): string {
  return name.trim().replace(/[<>\"']/g, "").slice(0, 255);
}

export function isValidEmail(email: string): boolean {
  // RFC 5322 compliant basic check + length limit
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) &&
    email.length <= 254 &&
    !/[\r\n,;]/.test(email);
}
