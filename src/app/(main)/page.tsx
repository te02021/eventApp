"use client";

import { useState } from "react";
import { DashboardView } from "@/components/event-app/dashboard-view";
import { CreationModal } from "@/components/event-app/creation-modal";
import { Plus } from "lucide-react"; // O el SVG que tenías

export default function HomePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      {/* 1. La Vista del Dashboard */}
      {/* Pasamos un nombre hardcodeado temporalmente hasta tener Auth real */}
      <DashboardView userName="Juan" />

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
    </>
  );
}
