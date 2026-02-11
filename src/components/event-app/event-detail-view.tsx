"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Para el botón volver
import {
  ArrowLeft,
  MapPin,
  CloudRain,
  AlertTriangle,
  Calendar as CalendarIcon,
  Settings,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChecklistTab } from "./checklist-tab";
import { MemoriesTab } from "./memories-tab";
import { TeamTab } from "./team-tab";

// Importamos los tipos
import type { EventWithDetails } from "@/lib/data";
import type { User } from "next-auth";
import { EditEventDialog } from "./edit-event-dialog";

export type EventTab = "checklist" | "bitacora" | "equipo";

interface EventDetailViewProps {
  initialData: EventWithDetails; // Recibimos el evento completo de la DB
  currentUser: User;
}

export function EventDetailView({
  initialData,
  currentUser,
}: EventDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EventTab>("checklist");
  const [showSettings, setShowSettings] = useState(false);

  // Si initialData es undefined (por seguridad), no renderizamos o mostramos loading
  if (!initialData) return null;

  // Formato de fechas
  const startDate = new Date(initialData.startDate).toLocaleDateString(
    "es-ES",
    {
      day: "numeric",
      month: "short",
    },
  );

  const endDate = initialData.endDate
    ? new Date(initialData.endDate).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* 1. HERO SECTION (Color Dinámico) */}
      <div
        className="relative h-64 w-full shrink-0 transition-colors"
        style={{ backgroundColor: initialData.color }} // <--- Color de la DB
      >
        {/* Gradiente para legibilidad */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 h-10 w-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/40 active:scale-95 transition-all text-white border border-white/10"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 h-10 w-10 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/40 active:scale-95 transition-all text-white border border-white/10"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Title & Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
            {initialData.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
            {/* Ubicación (Solo si existe) */}
            {initialData.location && (
              <span className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
                <MapPin className="h-4 w-4" />
                {initialData.location}
              </span>
            )}

            {/* Fechas */}
            <span className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md backdrop-blur-sm">
              <CalendarIcon className="h-4 w-4" />
              {startDate} {endDate ? `- ${endDate}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* 2. WEATHER ALERT (Opcional / Mockup) */}
      {/* Solo mostramos esto si es un Evento tipo "Viaje" (puedes ajustar esta lógica) */}
      {initialData.location && (
        <div className="px-4 -mt-6 relative z-10 mb-2">
          <Card className="p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-amber-500/30 shadow-lg flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500 shrink-0">
              <CloudRain className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground flex items-center gap-1">
                Clima en {initialData.location.split(",")[0]}
                <span className="text-[10px] font-normal text-muted-foreground ml-auto">
                  Hoy
                </span>
              </p>
              <p className="text-xs text-muted-foreground truncate">
                Parcialmente nublado, 28°C. Sin lluvias previstas.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* 3. TABS NAVIGATION */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm pt-2 px-4 border-b border-border/40 pb-2">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as EventTab)}
          className="w-full"
        >
          <TabsList className="w-full h-10 bg-muted/50 p-1 rounded-lg grid grid-cols-3">
            <TabsTrigger value="checklist" className="text-xs font-medium">
              Checklist
            </TabsTrigger>
            <TabsTrigger value="bitacora" className="text-xs font-medium">
              Bitácora
            </TabsTrigger>
            <TabsTrigger value="equipo" className="text-xs font-medium">
              Equipo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 4. TABS CONTENT */}
      {/* NOTA: Aquí pasaremos los datos reales a los hijos en el siguiente paso.
          Por ahora, les pasamos la data o placeholders para que no rompa.
      */}
      <div className="px-4 mt-4 flex-1">
        {activeTab === "checklist" && (
          <ChecklistTab
            categories={initialData.checklistCategories}
            eventId={initialData.id}
          />
        )}

        {activeTab === "bitacora" && (
          <MemoriesTab
            eventId={initialData.id}
            initialMemories={initialData.memories}
            userId={currentUser.id!}
          />
        )}

        {activeTab === "equipo" && (
          <TeamTab
            collaborators={initialData.collaborators}
            currentUser={currentUser}
          />
        )}
      </div>
      {/* --- 5. MODAL DE CONFIGURACIÓN --- */}
      <EditEventDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        event={{
          id: initialData.id,
          title: initialData.title,
          location: initialData.location,
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          color: initialData.color,
        }}
      />
    </div>
  );
}
