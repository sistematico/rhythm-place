"use server";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { createSession, clearSession } from "@/lib/session";
import { LoginSchema, type LoginFormState } from "@/lib/auth-definitions";

export async function login(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    return { message: "Email ou senha incorretos." };
  }

  const validPassword = await compare(password, user.passwordHash);
  if (!validPassword) {
    return { message: "Email ou senha incorretos." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
