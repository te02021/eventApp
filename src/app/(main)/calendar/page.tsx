"use client";

import { useRouter } from "next/navigation";
import { CalendarView } from "@/components/event-app/calendar-view";

export default function CalendarPage() {
  const router = useRouter();

  // Esta función simula lo que hacía handleEventClick antes
  const handleEventClick = (eventId?: string) => {
    // Si el calendario devuelve un ID, vamos a esa ruta
    // Si no, vamos a un ID de prueba
    router.push(`/events/${eventId || "1"}`);
  };

  return <CalendarView onEventClick={handleEventClick} />;
}
