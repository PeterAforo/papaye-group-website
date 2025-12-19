import crypto from "crypto";
import { z } from "zod";

// ==================== INPUT VALIDATION SCHEMAS ====================

export const emailSchema = z.string().email("Invalid email address").toLowerCase().trim();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

export const phoneSchema = z
  .string()
  .regex(/^[\d\s+()-]{10,20}$/, "Invalid phone number format")
  .optional()
  .or(z.literal(""));

export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().length(6).optional(),
});

// ==================== TOKEN GENERATION ====================

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ==================== RATE LIMITING ====================

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return new Date() < lockedUntil;
}

export function shouldLockAccount(failedAttempts: number): boolean {
  return failedAttempts >= MAX_LOGIN_ATTEMPTS;
}

export function getLockoutEndTime(): Date {
  return new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
}

// ==================== 2FA UTILITIES ====================

export function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString("base32").substring(0, 32);
}

export function verifyTOTPCode(secret: string, code: string): boolean {
  const timeStep = 30;
  const currentTime = Math.floor(Date.now() / 1000 / timeStep);
  
  // Check current time step and one before/after for clock drift
  for (let i = -1; i <= 1; i++) {
    const expectedCode = generateTOTP(secret, currentTime + i);
    if (expectedCode === code) {
      return true;
    }
  }
  return false;
}

function generateTOTP(secret: string, counter: number): string {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));
  
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "base32"));
  hmac.update(buffer);
  const hash = hmac.digest();
  
  const offset = hash[hash.length - 1] & 0xf;
  const binary =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

// ==================== SANITIZATION ====================

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim();
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// ==================== IP & USER AGENT ====================

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return null;
}

export function getUserAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}

// ==================== SECURITY HEADERS ====================

export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// ==================== CSRF PROTECTION ====================

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}
