"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EventDetailView } from "@/components/event-app/event-detail-view";

// Definimos el tipo de pestaña que usaba v0
type EventTab = "checklist" | "bitacora" | "equipo";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // Estado local para manejar qué pestaña se ve (Checklist vs Bitácora)
  const [currentTab, setCurrentTab] = useState<EventTab>("checklist");

  const handleBack = () => {
    // Vuelve a la página anterior (Dashboard o Calendario)
    router.back();
  };

  // Nota: En el futuro, usaremos params.id para cargar los datos reales de la DB.
  // Por ahora, EventDetailView mostrará datos estáticos.

  return (
    <EventDetailView
      activeTab={currentTab}
      onTabChange={setCurrentTab}
      onBack={handleBack}
    />
  );
}
