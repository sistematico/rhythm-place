import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/session";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SessionUser = { userId: number };

// O proxy já renova o access token via refresh token antes da requisição chegar aqui.
// Portanto, basta verificar o access token cookie.
export const verifySession = cache(async (): Promise<SessionUser> => {
  const jar = await cookies();
  const accessToken = jar.get("access_token")?.value;

  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return { userId: Number(payload.sub) };
  }

  redirect("/login");
});

export const getUser = cache(async () => {
  const session = await verifySession();

  const [user] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId))
    .limit(1);

  return user ?? null;
});
