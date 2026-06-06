import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Email inválido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Senha obrigatória." }),
});

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;
