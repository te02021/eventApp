"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  type: "event" | "routine";
  startDate: Date;
  endDate?: Date;
  location?: string;
  participants?: number;
  color: string;
  icon: string;
}
// --- DATA DUMMY DINÁMICA ---
// Usamos el año y mes actual para que siempre veas datos al probar
const TODAY = new Date();
const CURRENT_YEAR = TODAY.getFullYear();
const CURRENT_MONTH = TODAY.getMonth();
// Sample events data
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Vacaciones en Cancún",
    type: "event",
    startDate: new Date(CURRENT_YEAR, CURRENT_MONTH, 10),
    endDate: new Date(CURRENT_YEAR, CURRENT_MONTH, 17),
    location: "Cancún, México",
    participants: 4,
    color: "bg-sky-500",
    icon: "🏖️",
  },
  {
    id: "2",
    title: "Cumpleaños de María",
    type: "event",
    startDate: new Date(CURRENT_YEAR, CURRENT_MONTH, 15),
    location: "Casa de María",
    participants: 10,
    color: "bg-pink-500",
    icon: "🎂",
  },
  {
    id: "3",
    title: "Camping Fin de Semana",
    type: "event",
    startDate: new Date(CURRENT_YEAR, CURRENT_MONTH, 22),
    endDate: new Date(CURRENT_YEAR, CURRENT_MONTH, 24),
    location: "Montañas del Norte",
    participants: 5,
    color: "bg-green-500",
    icon: "🏕️",
  },
  {
    id: "4",
    title: "Medicación Diaria",
    type: "routine",
    startDate: new Date(CURRENT_YEAR, 0, 1), // Enero 1 (siempre activa)
    color: "bg-orange-500",
    icon: "💊",
  },
  {
    id: "5",
    title: "Entrenamiento",
    type: "routine",
    startDate: new Date(CURRENT_YEAR, 0, 1),
    color: "bg-blue-500",
    icon: "💪",
  },
];

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 2 + i);

interface CalendarViewProps {
  onEventClick?: (eventId: string) => void;
}

export function CalendarView({ onEventClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(TODAY.getMonth());
  const [currentYear, setCurrentYear] = useState(TODAY.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventSheet, setShowEventSheet] = useState(false);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [currentMonth, currentYear]);

  const getEventsForDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    return sampleEvents.filter((event) => {
      if (event.type === "routine") {
        return date >= event.startDate; // Routines appear every day
      }
      const start = new Date(event.startDate);
      start.setHours(0, 0, 0, 0);
      const end = event.endDate ? new Date(event.endDate) : new Date(start);
      end.setHours(23, 59, 59, 999);
      const currentDate = new Date(date);
      currentDate.setHours(12, 0, 0, 0);
      return currentDate >= start && currentDate <= end;
    });
  };

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate.getDate());
  }, [selectedDate, currentMonth, currentYear]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    setShowEventSheet(true);
  };

  const isToday = (day: number) => {
    return (
      day === TODAY.getDate() &&
      currentMonth === TODAY.getMonth() &&
      currentYear === TODAY.getFullYear()
    );
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground mb-3">
          Calendario
        </h1>

        {/* Year and Month Selectors */}
        <div className="flex items-center gap-2">
          <Select
            value={currentYear.toString()}
            onValueChange={(value) => setCurrentYear(parseInt(value))}
          >
            <SelectTrigger className="w-24 h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={currentMonth.toString()}
            onValueChange={(value) => setCurrentMonth(parseInt(value))}
          >
            <SelectTrigger className="flex-1 h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl bg-transparent"
              onClick={handlePrevMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl bg-transparent"
              onClick={handleNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="flex-1 px-4 py-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const events = getEventsForDate(day);
            const hasEvents = events.length > 0;
            const eventCount = events.filter((e) => e.type === "event").length;
            const routineCount = events.filter(
              (e) => e.type === "routine",
            ).length;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative",
                  isToday(day)
                    ? "bg-primary text-primary-foreground font-bold"
                    : hasEvents
                      ? "bg-muted/50 hover:bg-muted"
                      : "hover:bg-muted/30",
                  "active:scale-95",
                )}
              >
                <span className={cn("text-sm", isToday(day) && "font-bold")}>
                  {day}
                </span>
                {hasEvents && (
                  <div className="flex gap-0.5 mt-0.5">
                    {eventCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                    )}
                    {routineCount > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span>Eventos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span>Rutinas</span>
          </div>
        </div>

        {/* Upcoming Events Preview */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Próximos eventos
          </h3>
          {sampleEvents
            .filter((e) => e.type === "event")
            .slice(0, 3)
            .map((event) => (
              <Card
                key={event.id}
                className="p-3 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => onEventClick?.(event.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center text-lg",
                      event.color,
                      "text-white",
                    )}
                  >
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {event.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {event.startDate.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                      {event.endDate && (
                        <>
                          {" - "}
                          {event.endDate.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Event Detail Sheet */}
      <Sheet open={showEventSheet} onOpenChange={setShowEventSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[80vh]">
          <SheetHeader className="text-left pb-4">
            <SheetTitle className="capitalize">
              {selectedDate && formatDate(selectedDate)}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-3 overflow-y-auto pb-6">
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  No hay eventos para este día
                </p>
              </div>
            ) : (
              <>
                {/* Events */}
                {selectedDateEvents.filter((e) => e.type === "event").length >
                  0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Eventos
                    </h4>
                    {selectedDateEvents
                      .filter((e) => e.type === "event")
                      .map((event) => (
                        <Card
                          key={event.id}
                          className="p-4 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                          onClick={() => {
                            setShowEventSheet(false);
                            onEventClick?.(event.id);
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center text-xl shrink-0",
                                event.color,
                                "text-white",
                              )}
                            >
                              {event.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground">
                                {event.title}
                              </h4>
                              {event.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </p>
                              )}
                              {event.participants && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <Users className="h-3.5 w-3.5" />
                                  {event.participants} participantes
                                </p>
                              )}
                              {event.endDate && (
                                <Badge
                                  variant="secondary"
                                  className="mt-2 text-xs"
                                >
                                  {event.startDate.toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                  })}{" "}
                                  -{" "}
                                  {event.endDate.toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}

                {/* Routines */}
                {selectedDateEvents.filter((e) => e.type === "routine").length >
                  0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Rutinas diarias
                    </h4>
                    {selectedDateEvents
                      .filter((e) => e.type === "routine")
                      .map((event) => (
                        <Card
                          key={event.id}
                          className="p-3 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center text-lg shrink-0",
                                event.color,
                                "text-white",
                              )}
                            >
                              {event.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground text-sm">
                                {event.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Rutina recurrente
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
