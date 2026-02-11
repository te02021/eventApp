import { redirect } from "next/navigation";
import { ProfileView } from "@/components/event-app/profile-view";
import { auth } from "@/auth";

// Definimos los tipos aquí o los importamos si tienes un archivo de tipos
interface User {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  image?: string | null;
  age?: number | null;
}

export default async function ProfilePage() {
  // const router = useRouter();
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfileView user={session.user} />;
}
