import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { db } from "@/db";
import { refreshTokensTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET!,
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET!,
);

const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export type TokenPayload = { sub: string };

export async function signAccessToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(userId: number): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL}s`)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const accessToken = await signAccessToken(userId);
  const refreshToken = await signRefreshToken(userId);

  const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);

  await db.insert(refreshTokensTable).values({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiresAt,
  });

  const jar = await cookies();

  jar.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL,
  });

  jar.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  const refreshToken = jar.get("refresh_token")?.value;

  if (refreshToken) {
    await db
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, hashToken(refreshToken)));
  }

  jar.delete("access_token");
  jar.delete("refresh_token");
}
