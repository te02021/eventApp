"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Video, X, Trash2, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { toggleReaction, uploadMemory } from "@/actions/memory-actions";
import { UploadButton } from "@/lib/uploadthing";
import { Badge } from "@/components/ui/badge";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "🔥"];

interface MemoriesTabProps {
  eventId: string;
  initialMemories: any[]; // Data de la DB
  userId: string;
}

export function MemoriesTab({
  eventId,
  initialMemories,
  userId,
}: MemoriesTabProps) {
  const pathname = usePathname();
  const [reactions, setReactions] = useState<Record<number, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const handleCapture = () => {
    // Aquí iría la lógica para abrir la cámara o el input file
    console.log("Abrir cámara / Subir foto");
  };
  const handlePointerDown = (id: string) => {
    timerRef.current = setTimeout(() => {
      setOpenMenuId(id);
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate(50);
    }, 500);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // --- Lógica de Reacción ---
  const handleReact = async (memoryId: string, emoji: string) => {
    setOpenMenuId(null);
    const result = await toggleReaction(memoryId, emoji, pathname);
    if (!result.success) toast.error("Error al reaccionar");
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Masonry Photo Grid */}
      <div className="columns-2 gap-2 space-y-2">
        {initialMemories.map((photo) => {
          // Encontrar si YO reaccioné y qué emoji puse
          const myReaction = photo.reactions?.find(
            (r: any) => r.userId === userId,
          );

          return (
            <div
              key={photo.id}
              className="relative w-full rounded-xl overflow-hidden bg-muted transition-all break-inside-avoid mb-2 select-none border border-border/50 group"
              onPointerDown={() => handlePointerDown(photo.id)}
              onPointerUp={clearTimer}
              onPointerLeave={clearTimer}
              onPointerMove={clearTimer}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Usamos img tradicional para evitar conflictos de optimización de Next.js con dominios externos de fotos */}
              <img
                src={photo.url}
                alt="Momento"
                className="w-full h-auto object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Badge de Reacciones (Solo si hay) */}
              {photo.reactions?.length > 0 && (
                <div className="absolute bottom-2 right-2 flex gap-1 animate-in fade-in zoom-in duration-300">
                  <div className="bg-black/60 backdrop-blur-md rounded-full h-7 px-2.5 flex items-center justify-center text-sm shadow-lg border border-white/20 text-white">
                    {myReaction?.emoji || photo.reactions[0].emoji}
                    {photo.reactions.length > 1 && (
                      <span className="ml-1.5 text-[10px] font-bold text-white/90">
                        {photo.reactions.length}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Menú de Emojis al hacer Long Press */}
              {openMenuId === photo.id && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-200">
                  <div className="bg-background/95 p-2 rounded-full flex gap-2 shadow-xl mb-3 scale-110">
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReact(photo.id, emoji)}
                        className={cn(
                          "h-10 w-10 text-2xl flex items-center justify-center rounded-full transition-all hover:scale-125",
                          myReaction?.emoji === emoji
                            ? "bg-primary/20 ring-1 ring-primary"
                            : "",
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 rounded-full h-8 w-8 p-0"
                    onClick={() => setOpenMenuId(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Video Summary Card */}
      <Card
        className={cn(
          "p-4 border-dashed border-2 transition-all",
          initialMemories.length > 0 &&
            new Date() > new Date(initialMemories[0].createdAt)
            ? "bg-primary/5 border-primary/20"
            : "bg-muted/30",
        )}
      >
        <div className="flex flex-col items-center text-center py-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mb-3 bg-background shadow-sm border">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Resumen del Evento
          </h3>
          <p className="text-sm text-muted-foreground max-w-62.5">
            {initialMemories.length > 3
              ? "¡Estamos preparando tu video con los mejores momentos!"
              : "Sube al menos 4 fotos para generar tu video resumen."}
          </p>

          {initialMemories.length > 3 && (
            <Badge
              variant="secondary"
              className="mt-3 bg-primary/10 text-primary border-0 animate-pulse"
            >
              Generando Video...
            </Badge>
          )}
        </div>
      </Card>

      {/* Floating Camera Button - Sticky Bottom */}
      <div className="sticky bottom-4 flex justify-center pt-4 z-10">
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={async (res) => {
            if (res) {
              await uploadMemory(eventId, res[0].url);
              toast.success("¡Momento capturado!");
            }
          }}
          onUploadError={(error: Error) => {
            toast.error(`Error al subir: ${error.message}`);
          }}
          appearance={{
            button:
              "h-14 px-8 bg-primary text-primary-foreground rounded-full shadow-lg font-semibold gap-3 flex items-center hover:bg-primary/90 transition-all",
            allowedContent: "hidden",
          }}
          content={{
            button: (
              <div className="flex items-center gap-3">
                <Camera className="h-5 w-5" />
                <span>Capturar Momento</span>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}
