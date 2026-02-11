import { auth } from "@/auth";
import { getEventById } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { EventDetailView } from "@/components/event-app/event-detail-view";

// 1. CAMBIO IMPORTANTE: Definimos params como una Promesa
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 2. CAMBIO IMPORTANTE: Esperamos a que params se resuelva
  const resolvedParams = await params;
  const eventId = resolvedParams.id;

  // 3. Ahora sí consultamos la DB con el ID seguro
  const eventData = await getEventById(eventId);

  if (!eventData) {
    notFound();
  }

  return <EventDetailView initialData={eventData} currentUser={session.user} />;
}
