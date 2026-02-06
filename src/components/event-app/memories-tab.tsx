"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Video, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "🔥"];

const photos = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80",
    alt: "Paisaje de montaña",
    height: "h-32",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80",
    alt: "Lago cristalino",
    height: "h-44",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    alt: "Montañas nevadas",
    height: "h-36",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80",
    alt: "Noche estrellada",
    height: "h-40",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
    alt: "Picos montañosos",
    height: "h-32",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
    alt: "Playa paradisíaca",
    height: "h-44",
  },
];

export function MemoriesTab() {
  const [reactions, setReactions] = useState<Record<number, string>>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const handleCapture = () => {
    // Aquí iría la lógica para abrir la cámara o el input file
    console.log("Abrir cámara / Subir foto");
  };
  const handlePointerDown = (id: number) => {
    isLongPress.current = false;
    // Iniciamos un timer de 500ms
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setOpenMenuId(id); // Abrir menú
      // Vibración háptica si es posible (solo móviles)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };
  const handlePointerUp = () => {
    // Si soltamos el dedo antes de los 500ms, cancelamos el timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePointerMove = () => {
    // Si movemos el dedo (scrolleamos), cancelamos todo
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // --- Lógica de Reacción ---
  const handleReact = (photoId: number, emoji: string) => {
    setReactions((prev) => {
      // Si seleccionamos el mismo, lo quitamos (toggle). Si no, lo asignamos.
      if (prev[photoId] === emoji) {
        const newState = { ...prev };
        delete newState[photoId];
        return newState;
      }
      return { ...prev, [photoId]: emoji };
    });
    setOpenMenuId(null); // Cerrar menú
  };

  const handleRemoveReaction = (photoId: number) => {
    setReactions((prev) => {
      const newState = { ...prev };
      delete newState[photoId];
      return newState;
    });
    setOpenMenuId(null);
  };
  return (
    <div className="space-y-4 pb-24">
      {/* Masonry Photo Grid */}
      <div className="columns-2 gap-2 space-y-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`relative ${photo.height} w-full rounded-xl overflow-hidden bg-muted transition-all break-inside-avoid select-none`}
            // Eventos para detectar Long Press (Mouse y Touch)
            onPointerDown={() => handlePointerDown(photo.id)}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerMove={handlePointerMove}
            // Deshabilitar menú contextual del click derecho por defecto
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover pointer-events-none" // pointer-events-none ayuda a que el evento lo capture el div padre
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {reactions[photo.id] && openMenuId !== photo.id && (
              <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md rounded-full h-8 w-8 flex items-center justify-center text-lg shadow-sm animate-in zoom-in duration-200">
                {reactions[photo.id]}
              </div>
            )}
            {openMenuId === photo.id && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in duration-200">
                {/* Contenedor de Emojis */}
                <div className="bg-background/90 p-2 rounded-full flex gap-2 shadow-xl mb-2 scale-100 animate-in zoom-in-95 duration-150">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar cerrar inmediato
                        handleReact(photo.id, emoji);
                      }}
                      className={cn(
                        "h-10 w-10 text-2xl flex items-center justify-center rounded-full transition-transform hover:scale-125 active:scale-95",
                        reactions[photo.id] === emoji
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "hover:bg-muted",
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Botones de acción inferior */}
                <div className="flex gap-2">
                  {/* Botón Eliminar (solo si ya tiene reacción) */}
                  {reactions[photo.id] && (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveReaction(photo.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Botón Cerrar Menú */}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 rounded-full shadow-lg bg-white/20 text-white hover:bg-white/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Summary Card */}
      <Card className="p-4 border-dashed border-2 bg-muted/30">
        <div className="flex flex-col items-center text-center py-4">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Video Resumen</h3>
          <p className="text-sm text-muted-foreground">
            Tu video resumen estará listo el 20 de Enero.
          </p>
        </div>
      </Card>

      {/* Floating Camera Button - Sticky Bottom */}
      <div className="sticky bottom-4 flex justify-center pt-4 z-10">
        <Button
          size="lg"
          onClick={handleCapture}
          className="h-14 px-8 text-base font-semibold rounded-full shadow-lg gap-3"
        >
          <Camera className="h-5 w-5" />
          Capturar Momento
        </Button>
      </div>
    </div>
  );
}
