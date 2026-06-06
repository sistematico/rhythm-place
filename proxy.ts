import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { refreshTokensTable } from "@/db/schema";
import { signAccessToken } from "@/lib/session";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.ACCESS_TOKEN_SECRET!,
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET!,
);

const publicRoutes = ["/login"];
const ACCESS_TOKEN_TTL = 15 * 60;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = publicRoutes.includes(pathname);

  const accessToken = req.cookies.get("access_token")?.value;

  if (accessToken) {
    try {
      await jwtVerify(accessToken, ACCESS_SECRET, { algorithms: ["HS256"] });

      if (isPublic) {
        return NextResponse.redirect(new URL("/", req.nextUrl));
      }
      return NextResponse.next();
    } catch {
      // Access token expirado ou inválido — tenta renovar abaixo
    }
  }

  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (refreshToken && !isPublic) {
    try {
      const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET, {
        algorithms: ["HS256"],
      });

      const userId = Number(payload.sub);
      const tokenHash = createHash("sha256").update(refreshToken).digest("hex");

      const [stored] = await db
        .select({
          id: refreshTokensTable.id,
          expiresAt: refreshTokensTable.expiresAt,
        })
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenHash, tokenHash))
        .limit(1);

      if (stored && stored.expiresAt >= new Date()) {
        const newAccessToken = await signAccessToken(userId);
        const res = NextResponse.next();
        res.cookies.set("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: ACCESS_TOKEN_TTL,
        });
        return res;
      }
    } catch {
      // Refresh token inválido — cai para redirect ao login
    }

    const res = NextResponse.redirect(new URL("/login", req.nextUrl));
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  }

  if (!isPublic) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$).*)"],
};
