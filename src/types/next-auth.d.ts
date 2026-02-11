import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extendemos la interfaz User (lo que viene de la base de datos)
   */
  interface User {
    // Los obligatorios que pediste
    firstName: string | null;
    lastName: string | null;
    age: number | null;
    // Los opcionales o por defecto de Auth.js
    // id, name, email e image ya vienen por defecto en DefaultSession["user"]
    // pero podemos forzarlos si queremos ser explícitos.
  }

  /**
   * Extendemos la interfaz Session (lo que usas en el frontend: useSession)
   */
  interface Session {
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      age: number | null;
    } & DefaultSession["user"]; // Esto hereda name, email, image
  }
}

declare module "next-auth/jwt" {
  /**
   * Extendemos el token JWT para que pueda transportar tus datos
   */
  interface JWT {
    id: string;
    firstName: string | null;
    lastName: string | null;
    age: number | null;
  }
}
