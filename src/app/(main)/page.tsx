import DashboardView from "@/components/event-app/dashboard-view";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardEvents } from "@/lib/data";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const events = await getDashboardEvents(session.user.id);

  return <DashboardView user={session.user} events={events} />;
}
