"use client";
import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border rounded px-3 py-2 text-sm"
        />
        {state?.errors?.email && (
          <p className="text-red-500 text-xs">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border rounded px-3 py-2 text-sm"
        />
        {state?.errors?.password && (
          <p className="text-red-500 text-xs">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-red-500 text-sm text-center">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-black text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
