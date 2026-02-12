"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Flame,
  Check,
  Cloud,
  Sun,
  CalendarX, // <--- Nuevo (Para activos vacíos)
  Inbox, // <--- Nuevo (Para pendientes vacíos)
  History, // <--- Nuevo (Para historial vacío)
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NotificationsBtn } from "@/components/event-app/notifications-btn";

import { CreationModal } from "@/components/event-app/creation-modal";
import { Plus } from "lucide-react"; // O el SVG que tenías
import type { Session } from "next-auth";
import type { DashboardEvent } from "@/lib/data";

import { toggleRoutine } from "@/actions/routine-actions";
import { toast } from "sonner";

import { WeatherCard } from "@/components/event-app/weather-card";

interface DashboardViewProps {
  user: Session["user"];
  events: DashboardEvent[];
}

type TabValue = "activos" | "pendientes" | "historial";

export default function DashboardView({ user, events }: DashboardViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [activeTab, setActiveTab] = useState<TabValue>("activos");
  const [medicationChecked, setMedicationChecked] = useState(false);

  const now = new Date();
  // Ignoramos la hora local, tomamos la fecha calendario actual y la convertimos a un timestamp UTC
  const todayTimestamp = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const activeItems: any[] = [];
  const pendingItems: any[] = [];
  const historyItems: any[] = [];

  events.forEach((item) => {
    if (item.type === "routine") {
      if (item.isCompletedToday) {
        historyItems.push(item);
      } else {
        activeItems.push(item);
      }
    } else {
      // 2. Convertimos las fechas del evento a timestamps UTC limpios (solo fecha)
      const start = new Date(item.startDate);
      // Extraemos componentes UTC porque así lo guardamos en la DB
      const startTimestamp = Date.UTC(
        start.getUTCFullYear(),
        start.getUTCMonth(),
        start.getUTCDate(),
      );

      const end = item.endDate ? new Date(item.endDate) : start;
      const endTimestamp = Date.UTC(
        end.getUTCFullYear(),
        end.getUTCMonth(),
        end.getUTCDate(),
      );

      // 3. Comparación Simple de Números (Timestamps)
      if (endTimestamp < todayTimestamp) {
        historyItems.push(item); // Terminó ayer o antes
      } else if (startTimestamp > todayTimestamp) {
        pendingItems.push(item); // Empieza mañana o después
      } else {
        activeItems.push(item); // Está ocurriendo hoy
      }
    }
  });

  const featuredLocation =
    activeItems.find((i) => i.location)?.location ||
    pendingItems.find((i) => i.location)?.location ||
    "Buenos Aires, Argentina"; // Fallback por defecto
  const handleCheck = async (routineId: string, routineTitle: string) => {
    // Usamos una promesa o simplemente esperamos, pero mostramos feedback rico
    const result = await toggleRoutine(routineId);

    if (result.success) {
      if (result.action === "checked") {
        // CASO: COMPLETADO (Celebración 🎉)
        toast.success("¡Objetivo completado!", {
          description: `Has terminado "${routineTitle}". ¡Sigue así! 🔥`,
          duration: 4000, // Dura un poco más para permitir leer
          action: {
            label: "Deshacer",
            onClick: () => handleCheck(routineId, routineTitle), // Permite revertir al instante
          },
          // Opcional: Estilo personalizado para este toast específico
          className: "border-green-500/20 bg-green-500/5",
        });
      } else {
        // CASO: DESMARCADO (Información ℹ️)
        toast.info("Progreso actualizado", {
          description: `"${routineTitle}" vuelve a estar pendiente.`,
          duration: 3000,
          icon: <History className="h-4 w-4 text-blue-500" />, // Icono personalizado
        });
      }
    } else {
      toast.error("Error de sincronización", {
        description: "No se pudo guardar el cambio. Inténtalo de nuevo.",
      });
    }
  };

  const formatDate = (dateString: Date) => {
    const d = new Date(dateString);
    // Usamos UTC para mostrar porque así lo guardamos
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
    ).toLocaleDateString();
  };

  const getCalendarData = (dateString: Date) => {
    const d = new Date(dateString);
    // Usamos UTC para extraer los datos visuales
    const utcDate = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
    );
    return {
      day: utcDate.getDate(),
      month: utcDate
        .toLocaleString("es-ES", { month: "short" })
        .toUpperCase()
        .replace(".", ""),
    };
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage
                  src={
                    user.image ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=user1"
                  }
                  alt="Usuario"
                />
                <AvatarFallback>{user.image}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <p className="text-sm text-muted-foreground">Bienvenido</p>
              <h1 className="text-lg font-semibold text-foreground">
                Hola, {user.firstName}
              </h1>
            </div>
          </div>
          <NotificationsBtn />
        </div>
      </header>

      <div className="px-4 py-4 space-y-5">
        {/* Weather Widget */}
        <WeatherCard locationName={featuredLocation} variant="dashboard" />

        {/* Segmented Control Tabs */}
        <div className="flex bg-muted/50 p-1 rounded-xl">
          {(["activos", "pendientes", "historial"] as TabValue[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all",
                activeTab === tab
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === "activos" && (
          <div className="space-y-4">
            {/* Event Card - Vacaciones en Cancún */}
            {/* Loop de Eventos */}
            {/* Loop de Eventos (Diseño Full Color) */}
            {activeItems
              .filter((i) => i.type === "event")
              .map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="block group mb-4"
                >
                  <Card
                    className="relative h-48 overflow-hidden cursor-pointer hover:shadow-lg active:scale-[0.98] transition-all border-0"
                    style={{ backgroundColor: event.color }}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent z-0" />

                    <div className="relative z-10 flex flex-col justify-between h-full p-4">
                      <div className="flex gap-2">
                        <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-md hover:bg-white/30">
                          {formatDate(event.startDate)}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 drop-shadow-sm">
                          {event.title}
                        </h3>

                        {event.location && (
                          <p className="text-white/90 text-sm flex items-center gap-1.5 font-medium">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            {/* Routine Card - Medicación Diaria */}
            {/* Separador visual si hay rutinas */}
            {activeItems
              .filter((i) => i.type === "routine")
              .map((routine) => (
                <Card
                  key={routine.id}
                  className="p-4 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm transition-transform active:scale-90"
                        style={{ backgroundColor: routine.color }}
                      >
                        {routine.title.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {routine.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ¡Dale caña hoy!
                        </p>
                      </div>
                    </div>

                    {/* BOTÓN DE CHECK REAL */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheck(routine.id, routine.title);
                      }}
                      className="h-12 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Check
                    </button>
                  </div>
                </Card>
              ))}

            {/* Mensaje si no hay nada */}
            {/* Empty State para Activos */}
            {activeItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <CalendarX className="h-6 w-6 opacity-50" />
                </div>
                <p className="font-medium text-foreground">Todo despejado</p>
                <p className="text-sm">
                  No tienes eventos ni rutinas para hoy.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-primary text-sm font-medium hover:underline"
                >
                  Crear
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "pendientes" && (
          <div className="space-y-3">
            {pendingItems
              .filter((i) => i.type === "event")
              .map((event) => {
                const { day, month } = getCalendarData(event.startDate);
                const daysLeft = Math.ceil(
                  (new Date(event.startDate).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24),
                );

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block group mb-3"
                  >
                    <Card
                      className="flex overflow-hidden hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer border-0 text-white"
                      style={{ backgroundColor: event.color }}
                    >
                      <div className="w-16 bg-black/20 flex flex-col items-center justify-center p-2 text-center shrink-0 backdrop-blur-sm">
                        <span className="text-xs font-semibold text-white/80">
                          {month}
                        </span>
                        <span className="text-2xl font-bold text-white shadow-sm">
                          {day}
                        </span>
                      </div>
                      <div className="flex-1 p-4 flex items-center justify-between">
                        <div className="overflow-hidden pr-2">
                          <Badge className="mb-2 text-[10px] h-5 px-2 font-medium bg-white/25 hover:bg-white/40 text-white border-0 backdrop-blur-md">
                            Faltan {daysLeft} días
                          </Badge>
                          <h3 className="font-bold text-lg text-white truncate drop-shadow-md">
                            {event.title}
                          </h3>
                          {event.location && (
                            <p className="text-xs text-white/90 mt-1 truncate max-w-50 flex items-center gap-1">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                        <div className="text-white/40">
                          <CalendarDays className="h-6 w-6" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}

            {/* Empty State para Pendientes */}
            {pendingItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Inbox className="h-6 w-6 opacity-50" />
                </div>
                <p className="font-medium text-foreground">
                  Sin planes futuros
                </p>
                <p className="text-sm">No tienes eventos próximos agendados.</p>
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO HISTORIAL */}
        {activeTab === "historial" && (
          <div className="space-y-3">
            {historyItems
              .filter((i) => i.type === "routine")
              .map((routine) => (
                <Card
                  key={routine.id}
                  className="p-4 opacity-75 hover:opacity-100 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Check className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground line-through decoration-muted-foreground/50">
                          {routine.title}
                        </h3>
                        <p className="text-sm text-green-600 font-medium">
                          Completado hoy
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheck(routine.id, routine.title);
                      }}
                      className="text-xs text-muted-foreground hover:text-red-500 underline"
                    >
                      Deshacer
                    </button>
                  </div>
                </Card>
              ))}

            {historyItems
              .filter((i) => i.type === "event")
              .map((event) => (
                <Card
                  key={event.id}
                  className="p-4 opacity-60 grayscale hover:grayscale-0 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      📅
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-xs">
                        Finalizado el{" "}
                        {formatDate(event.endDate || event.startDate)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}

            {historyItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/5">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                  <History className="h-6 w-6 opacity-50" />
                </div>
                <p className="font-medium text-foreground">Historial vacío</p>
                <p className="text-sm">
                  Tus actividades completadas aparecerán aquí.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* 2. El Botón Flotante (FAB) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-4 lg:absolute lg:bottom-24 lg:right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all z-20"
        aria-label="Crear nuevo evento"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* 3. El Modal de Creación */}
      <CreationModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}
