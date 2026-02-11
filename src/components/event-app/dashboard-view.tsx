"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Bell, Flame, Check, Cloud, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { NotificationsBtn } from "@/components/event-app/notifications-btn";

import { CreationModal } from "@/components/event-app/creation-modal";
import { Plus } from "lucide-react"; // O el SVG que tenías
import type { Session } from "next-auth";

interface DashboardViewProps {
  user: Session["user"];
}

type TabValue = "activos" | "pendientes" | "historial";

export default function DashboardView({ user }: DashboardViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [activeTab, setActiveTab] = useState<TabValue>("activos");
  const [medicationChecked, setMedicationChecked] = useState(false);

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
        <Card className="p-4 bg-linear-to-br from-sky-500 to-cyan-400 border-0 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">Clima en Cancún</p>
                <p className="text-xl font-bold">28°C</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Parcialmente nublado</p>
              <div className="flex items-center gap-1 mt-1">
                <Cloud className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/80">15%</span>
              </div>
            </div>
          </div>
        </Card>

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
            <Link href="/events/1" className="block group">
              <Card className="relative overflow-hidden cursor-pointer hover:shadow-md active:scale-[0.98] transition-all">
                <div className="relative h-48">
                  <img
                    src="/images/cover/trip-south.jpg"
                    alt="Vacaciones en Cancún"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-green-500/90 text-white border-0 text-xs">
                      En Curso
                    </Badge>
                    <Badge className="bg-black/50 text-white border-0 text-xs backdrop-blur-sm">
                      Faltan 2 días
                    </Badge>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Vacaciones en Cancún
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>Progreso del checklist</span>
                        <span>40%</span>
                      </div>
                      <Progress value={40} className="h-1.5 bg-white/20" />
                    </div>
                    {/* Participants */}
                    <div className="absolute bottom-4 right-4 flex -space-x-2">
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=p1" />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=p2" />
                        <AvatarFallback>B</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=p3" />
                        <AvatarFallback>C</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Routine Card - Medicación Diaria */}
            <Card className="p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Medicación Diaria
                    </h3>
                    <p className="text-sm text-orange-500 font-medium flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />
                      15 días de racha
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMedicationChecked(!medicationChecked)}
                  className={cn(
                    "h-12 px-5 text-sm font-medium rounded-full transition-all flex items-center gap-2",
                    medicationChecked
                      ? "bg-green-500 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
                  )}
                >
                  <Check className="h-4 w-4" />
                  {medicationChecked ? "Listo" : "Check del día"}
                </button>
              </div>
            </Card>

            {/* Routine Card - Entrenamiento */}
            <Card className="p-4 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl">💪</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Entrenamiento Diario
                    </h3>
                    <p className="text-sm text-blue-500 font-medium flex items-center gap-1">
                      <Flame className="h-3.5 w-3.5" />8 días de racha
                    </p>
                  </div>
                </div>
                <button
                  className="h-12 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Check className="h-4 w-4" />
                  Check del día
                </button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "pendientes" && (
          <div className="space-y-3">
            <Link href="/events/2" className="block">
              <Card className="p-4 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <span className="text-2xl">🎂</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      Cumpleaños de María
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      15 Feb - 3 invitados
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Próximo
                  </Badge>
                </div>
              </Card>
            </Link>
            <Link href="/events/3" className="block">
              <Card className="p-4 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <span className="text-2xl">🏕️</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      Camping Fin de Semana
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      22 Feb - 24 Feb - 5 participantes
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Próximo
                  </Badge>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {activeTab === "historial" && (
          <div className="space-y-3">
            <Card className="p-4 opacity-70">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">🏖️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Viaje a la Playa
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Dic 2024 - Completado
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Finalizado
                </Badge>
              </div>
            </Card>
            <Card className="p-4 opacity-70">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">🎄</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    Cena de Navidad
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    25 Dic 2024 - Completado
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Finalizado
                </Badge>
              </div>
            </Card>
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
