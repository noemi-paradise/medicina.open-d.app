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
  return crypto
    .createHmac("sha256", secret)
    .update(`${casoId}:${compromisoId}`)
    .digest("hex");
}

export function verifySignToken(
  token: string,
  casoId: number,
  compromisoId: number
): boolean {
  const expected = generateSignToken(casoId, compromisoId);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(token, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
