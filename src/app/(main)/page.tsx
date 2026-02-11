import DashboardView from "@/components/event-app/dashboard-view";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardView user={session.user} />;
}
