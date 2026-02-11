import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { db } from "./db";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { Adapter } from "next-auth/adapters";

import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db) as Adapter,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Correo electronico",
          type: "email",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
          if (!user || !user.password) {
            return null;
          }

          const matchPassword = await bcrypt.compare(password, user.password);

          if (matchPassword) {
            return user;
          } else {
            return null;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.age = (user as any).age;
        token.lastName = (user as any).lastName;
        token.firstName = (user as any).firstName;
        token.image = user.image;
        token.name = `${(user as any).firstName} ${(user as any).lastName}`;
      }
      if (trigger === "update" && session?.user) {
        token.firstName = session.user.firstName;
        token.lastName = session.user.lastName;
        token.age = session.user.age;
        token.image = session.user.image;
        token.name = `${session.user.firstName} ${session.user.lastName}`;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.age = token.age as number;
        session.user.image = token.image as string; // Importante pasar la imagen
        session.user.name = token.name;
      }
      return session;
    },
  },
});
