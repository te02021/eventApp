"use client";
import Image from "next/image";
import { ArrowLeft, MapPin, CloudRain, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChecklistTab } from "./checklist-tab";
import { MemoriesTab } from "./memories-tab";
import { TeamTab } from "./team-tab";

export type EventTab = "checklist" | "bitacora" | "equipo";

interface EventDetailViewProps {
  activeTab: EventTab;
  onTabChange: (tab: EventTab) => void;
  onBack: () => void;
}

export function EventDetailView({
  activeTab,
  onTabChange,
  onBack,
}: EventDetailViewProps) {
  return (
    <div className="flex flex-col min-h-full bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-64 w-full shrink-0">
        <Image
          src="/images/trip-south.jpg"
          alt="Vacaciones en Cancún"
          fill
          className="object-cover"
          priority // Prioridad alta para que cargue inmediato (LCP)
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 h-11 w-11 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/50 active:scale-95 transition-all"
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            Vacaciones en Cancún
          </h1>
          <div className="flex items-center gap-3 text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Cancún, México
            </span>
            <span className="text-white/60">|</span>
            <span>10 - 20 Ene 2025</span>
          </div>
        </div>
      </div>

      {/* Weather Alert Banner - Glassmorphism */}
      <div className="px-4 -mt-5 relative z-10">
        <Card className="p-4 bg-amber-500/90 backdrop-blur-md border-0 text-white shadow-lg">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CloudRain className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold text-sm">Alerta de Clima</span>
              </div>
              <p className="text-sm text-white/90">
                Lluvia pronosticada para la tarde. Revisa tu equipamiento
                impermeable.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation - Sticky */}
      <div className="sticky top-0 z-20 bg-background pt-4 px-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => onTabChange(v as EventTab)}
        >
          <TabsList className="w-full h-12 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="checklist"
              className="flex-1 h-10 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Checklist
            </TabsTrigger>
            <TabsTrigger
              value="bitacora"
              className="flex-1 h-10 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Bitácora
            </TabsTrigger>
            <TabsTrigger
              value="equipo"
              className="flex-1 h-10 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              Equipo
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tabs Content Wrapper */}
      <div className="px-4 mt-2 flex-1">
        {activeTab === "checklist" && <ChecklistTab />}
        {activeTab === "bitacora" && <MemoriesTab />}
        {activeTab === "equipo" && <TeamTab />}
      </div>
    </div>
  );
}
