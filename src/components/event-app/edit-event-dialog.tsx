"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Save, CalendarIcon, MapPin } from "lucide-react";
import { updateEvent, deleteEvent } from "@/actions/event-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    title: string;
    location: string | null;
    startDate: Date;
    endDate: Date | null;
    color: string;
  };
}

const COLORS = [
  "#3b82f6", // Blue
  "#ef4444", // Red
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
];

export function EditEventDialog({
  open,
  onOpenChange,
  event,
}: EditEventDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Estado del formulario
  const [title, setTitle] = useState(event.title);
  const [location, setLocation] = useState(event.location || "");
  const [startDate, setStartDate] = useState(
    event.startDate.toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    event.endDate ? event.endDate.toISOString().split("T")[0] : "",
  );
  const [selectedColor, setSelectedColor] = useState(event.color);

  const handleUpdate = async () => {
    if (!title.trim() || !startDate) {
      toast.error("El título y la fecha de inicio son obligatorios");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateEvent(event.id, {
        title,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        color: selectedColor,
      });

      if (result.success) {
        toast.success("Evento actualizado correctamente");
        onOpenChange(false);
      } else {
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await deleteEvent(event.id);
      if (result.success) {
        toast.success("Evento eliminado");
        router.push("/");
      } else {
        toast.error("Error al eliminar");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Error inesperado");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Configuración del Evento</DialogTitle>
          <DialogDescription>
            Modifica los detalles o elimina el evento permanentemente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Título */}
          <div className="grid gap-2">
            <Label htmlFor="title">Nombre del evento</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Ubicación */}
          <div className="grid gap-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Ubicación
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ej: Cancún, México"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />{" "}
                Inicio
              </Label>
              <Input
                id="start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">Fin (Opcional)</Label>
              <Input
                id="end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Color Picker */}
          <div className="grid gap-2">
            <Label>Color del tema</Label>
            <div className="flex flex-wrap gap-3 mt-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-110 hover:opacity-90"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Eliminar</span>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
