"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  CloudRain,
  Calendar,
  MessageSquare,
  CheckSquare,
  X,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// --- Tipos para nuestras notificaciones ---
type NotificationType = "weather" | "task" | "message" | "event";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  eventName: string;
  time: string;
  read: boolean;
}

// --- Datos Mock (Ordenados del más reciente al más antiguo) ---
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "weather",
    title: "Alerta de Lluvia",
    description: "Se pronostican lluvias para esta tarde. Prepara el equipo.",
    eventName: "Vacaciones en Cancún",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: "2",
    type: "task",
    title: "Tarea Completada",
    description: "Juan marcó 'Comprar protector solar' como listo.",
    eventName: "Vacaciones en Cancún",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: "3",
    type: "message",
    title: "Nuevo comentario",
    description: "María comentó en la bitácora: '¡Qué buena foto!'",
    eventName: "Escapada de Fin de Semana",
    time: "Ayer, 18:30",
    read: true,
  },
  {
    id: "4",
    type: "event",
    title: "Evento próximo",
    description: "Faltan 2 días para tu viaje a la montaña.",
    eventName: "Trekking Montaña",
    time: "20 Ene, 09:00",
    read: true,
  },
];

// --- Configuración de Iconos y Colores ---
const iconConfig = {
  weather: { icon: CloudRain, color: "text-amber-500", bg: "bg-amber-500/10" },
  task: { icon: CheckSquare, color: "text-green-500", bg: "bg-green-500/10" },
  message: {
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  event: { icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export function NotificationsBtn() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  // Calcular no leídas
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative h-11 w-11 flex items-center justify-center rounded-full hover:bg-muted active:bg-muted/80 transition-colors focus:outline-none"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 sm:w-96 p-0 mr-4" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notificaciones</h4>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Marcar leídas
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="h-[calc(100vh-300px)] max-h-100">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No tienes notificaciones
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Te avisaremos cuando haya novedades en tus eventos.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const Icon = iconConfig[notification.type].icon;
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleMarkOneRead(notification.id)}
                    className={cn(
                      "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0 relative group",
                      !notification.read ? "bg-primary/5" : "bg-transparent",
                    )}
                  >
                    {/* Icon Container */}
                    <div
                      className={cn(
                        "mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        iconConfig[notification.type].bg,
                        iconConfig[notification.type].color,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium leading-none",
                            !notification.read
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-[10px] font-medium text-primary mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary/50" />
                        {notification.eventName}
                      </p>
                    </div>

                    {/* Unread Indicator Dot */}
                    {!notification.read && (
                      <span className="absolute top-4 right-2 h-2 w-2 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
