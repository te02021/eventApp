"use client";

import { useRouter } from "next/navigation";
import { ProfileView } from "@/components/event-app/profile-view";

// Definimos los tipos aquí o los importamos si tienes un archivo de tipos
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  avatar: string;
}

// Datos falsos para que la vista no falle
const DUMMY_USER: User = {
  id: "1",
  email: "usuario@ejemplo.com",
  firstName: "Juan",
  lastName: "Pérez",
  age: 28,
  avatar: "", // Si tienes una URL de avatar, ponla aquí
};

export default function ProfilePage() {
  const router = useRouter();

  const handleUpdateUser = (updatedUser: User) => {
    console.log("Usuario actualizado:", updatedUser);
    // Aquí luego llamaremos a una Server Action para guardar en DB
  };

  const handleLogout = () => {
    // Borramos datos locales si existen
    localStorage.removeItem("eventapp_user");
    // Redirigimos al Login
    router.push("/login");
  };

  return (
    <ProfileView
      user={DUMMY_USER}
      onUpdateUser={handleUpdateUser}
      onLogout={handleLogout}
    />
  );
}
