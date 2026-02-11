"use client";
import { SessionProvider } from "next-auth/react";

// Definimos la interfaz para que TypeScript no se queje
interface Props {
  children: React.ReactNode;
}

// Fíjate en las llaves { } alrededor de children 👇
export default function SessionWrapper({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
