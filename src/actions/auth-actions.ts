"use server";
import { hash } from "bcryptjs";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { signOut } from "@/auth";
import { AuthError } from "next-auth";

interface RegisterProps {
  name: string;
  email: string;
  password: string;
  lastName: string;
  age: number;
}

type PrevState = {
  error?: string;
  success?: boolean;
} | null;

export async function login(prevState: PrevState, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/", // O "/dashboard" si esa es tu ruta protegida
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return {
          error: "Credenciales invalidas",
        };
      }
      return { error: "Ocurrió un error desconocido" };
    }
    throw error;
  }
  return { success: true };
}

export async function register({
  name,
  email,
  password,
  lastName,
  age,
}: RegisterProps) {
  const emailExists = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (emailExists.length > 0) {
    return { error: "El usuario ya existe" };
  }
  const hashedPassword = await hash(password, 10);
  try {
    await db.insert(users).values({
      name: `${name} ${lastName}`,
      firstName: name,
      email,
      password: hashedPassword,
      lastName,
      age,
    });
    return { success: true };
  } catch (error) {
    console.error("Error al registrar:", error);
    return { error: "Error al crear el usuario en la base de datos" };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
