import { SignJWT, jwtVerify } from "jose";
import { compare, hash } from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "cyberguard-dev-secret-change-me"
);

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "analyst" | "viewer";
  twoFactorEnabled: boolean;
  createdAt: string;
};

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string) {
  return compare(password, hashed);
}

export async function createToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AuthUser["role"],
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
  };
}
