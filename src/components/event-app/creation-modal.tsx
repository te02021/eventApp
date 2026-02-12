"use client";

import { useState } from "react";
import {
  Briefcase,
  Repeat,
  MapPin,
  ArrowLeft,
  ArrowRight,
  X,
  Calendar,
  Map,
  Plus,
  Trash2,
  Edit3,
  Check,
  FolderPlus,
  Users,
  UserPlus,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import createEvent from "@/actions/event-actions";
import { LocationInput } from "../location-input";

interface CreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type EventType = "event" | "routine" | null;
type Step = 1 | 2 | 3;

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface CategoryItem {
  id: string;
  name: string;
  completed: boolean;
  assignedTo: User[];
}

interface Category {
  id: string;
  name: string;
  items: CategoryItem[];
}

// Event participants - in a real app this would come from user input
const eventParticipants: User[] = [
  {
    id: "1",
    name: "Juan García",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=juan",
  },
  {
    id: "2",
    name: "María López",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maria",
  },
  {
    id: "3",
    name: "Carlos Ruiz",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
  },
  {
    id: "4",
    name: "Ana Martín",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ana",
  },
];

export function CreationModal({ open, onOpenChange }: CreationModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<EventType>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [color, setColor] = useState("#4f46e5");

  // Category management state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Item management state
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    null,
  );
  const [newItemName, setNewItemName] = useState("");
  const [newItemAssignees, setNewItemAssignees] = useState<User[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemAssignees, setEditingItemAssignees] = useState<User[]>([]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setSelectedType(null);
      setTitle("");
      setLocation("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setCategories([]);
      setNewCategoryName("");
      setEditingCategoryId(null);
      setExpandedCategoryId(null);
      setNewItemName("");
      setNewItemAssignees([]);
    }, 300);
  };

  const handleNext = () => {
    if (step === 1 && selectedType) {
      setStep(2);
    } else if (
      step === 2 &&
      title.trim() &&
      (selectedType === "routine" || (startDate && endDate))
    ) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleCreate = async () => {
    // 1. Transformamos los datos para que coincidan con el Backend (name -> title)
    const formattedCategories = categories.map((cat) => ({
      name: cat.name,
      items: cat.items.map((item) => ({
        title: item.name, // <--- AQUÍ ESTÁ LA SOLUCIÓN
        isCompleted: item.completed, // Si el back lo pide, agrégalo también
      })),
    }));

    const payload = {
      type: selectedType,
      description,
      title,
      location,
      startDate: new Date(startDate),
      endDate: selectedType === "event" && endDate ? new Date(endDate) : null,

      categories: formattedCategories,

      color,
    };
    await createEvent(payload);

    handleClose();
  };

  // Category CRUD operations
  const addCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
        items: [],
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setExpandedCategoryId(newCategory.id);
    }
  };

  const updateCategory = (categoryId: string) => {
    if (editingCategoryName.trim()) {
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, name: editingCategoryName.trim() }
            : cat,
        ),
      );
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  };

  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId));
    if (expandedCategoryId === categoryId) {
      setExpandedCategoryId(null);
    }
  };

  // Item CRUD operations with multi-user assignment
  const addItem = (categoryId: string) => {
    if (newItemName.trim()) {
      const newItem: CategoryItem = {
        id: `item-${Date.now()}`,
        name: newItemName.trim(),
        completed: false,
        assignedTo: newItemAssignees,
      };
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: [...cat.items, newItem] }
            : cat,
        ),
      );
      setNewItemName("");
      setNewItemAssignees([]);
    }
  };

  const startEditItem = (item: CategoryItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
    setEditingItemAssignees(item.assignedTo);
  };

  const updateItem = (categoryId: string, itemId: string) => {
    if (editingItemName.trim()) {
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        name: editingItemName.trim(),
                        assignedTo: editingItemAssignees,
                      }
                    : item,
                ),
              }
            : cat,
        ),
      );
      setEditingItemId(null);
      setEditingItemName("");
      setEditingItemAssignees([]);
    }
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat,
      ),
    );
  };

  const toggleUserAssignment = (
    user: User,
    currentList: User[],
    setList: (users: User[]) => void,
  ) => {
    const isAssigned = currentList.some((u) => u.id === user.id);
    if (isAssigned) {
      setList(currentList.filter((u) => u.id !== user.id));
    } else {
      setList([...currentList, user]);
    }
  };

  const canProceedToStep3 =
    selectedType === "event" && title.trim() && startDate && endDate;

  // Compact user selector for creation modal
  const CompactUserSelector = ({
    selectedUsers,
    onToggle,
  }: {
    selectedUsers: User[];
    onToggle: (user: User) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>Asignar responsables</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {eventParticipants.map((user) => {
          const isSelected = selectedUsers.some((u) => u.id === user.id);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onToggle(user)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-xs",
                isSelected
                  ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/50 bg-background",
              )}
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-[8px]">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.name.split(" ")[0]}</span>
              {isSelected && <Check className="h-3 w-3 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Assigned users display
  const AssignedUsersDisplay = ({ users }: { users: User[] }) => {
    if (users.length === 0) return null;

    return (
      <div
        className="flex items-center -space-x-1.5"
        title={users.map((u) => u.name).join(", ")}
      >
        {users.slice(0, 2).map((user) => (
          <Avatar key={user.id} className="h-5 w-5 border border-background">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-[8px] bg-primary/10">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
        ))}
        {users.length > 2 && (
          <div className="h-5 w-5 rounded-full bg-muted border border-background flex items-center justify-center">
            <span className="text-[8px] font-medium">+{users.length - 2}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Crear nuevo evento o rutina</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted active:scale-95 transition-all"
                aria-label="Volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {step === 1
                  ? "Crear nuevo"
                  : step === 2
                    ? selectedType === "event"
                      ? "Nuevo Evento"
                      : "Nueva Rutina"
                    : "Categorías"}
              </h2>
              {step === 3 && (
                <p className="text-xs text-muted-foreground">
                  Define las categorías de ítems para tu evento
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted active:scale-95 transition-all"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Indicator */}
        {selectedType === "event" && step > 1 && (
          <div className="px-4 pt-3 shrink-0">
            <div className="flex gap-2">
              <div className="flex-1 h-1 rounded-full bg-primary" />
              <div
                className={cn(
                  "flex-1 h-1 rounded-full",
                  step >= 2 ? "bg-primary" : "bg-muted",
                )}
              />
              <div
                className={cn(
                  "flex-1 h-1 rounded-full",
                  step >= 3 ? "bg-primary" : "bg-muted",
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Paso {step} de 3
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center mb-6">
                ¿Qué deseas crear?
              </p>
              <div className="grid grid-cols-1 gap-4">
                {/* Event Option */}
                <button
                  onClick={() => setSelectedType("event")}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all hover:border-primary/50 active:scale-[0.98] text-left",
                    selectedType === "event"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                      selectedType === "event"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <Briefcase className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Evento Temporal
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Viajes, Reuniones, Fiestas
                    </p>
                  </div>
                </button>

                {/* Routine Option */}
                <button
                  onClick={() => setSelectedType("routine")}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all hover:border-primary/50 active:scale-[0.98] text-left",
                    selectedType === "routine"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "h-16 w-16 rounded-2xl flex items-center justify-center transition-colors shrink-0",
                      selectedType === "routine"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <Repeat className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">
                      Rutina Recurrente
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hábitos, Gimnasio, Medicación
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            <div className="space-y-5">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Título
                </Label>
                <Input
                  id="title"
                  placeholder={
                    selectedType === "event"
                      ? "Ej: Vacaciones en Cancún"
                      : "Ej: Meditación diaria"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 text-base rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripcion
                </Label>
                <Input
                  id="title"
                  placeholder={
                    selectedType === "event"
                      ? "Ej: Ir de viaje a la playa a descansar"
                      : "Ej: Tomar la pastilla de la tiroides"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12 text-base rounded-xl"
                />
              </div>

              {/* Location Input with Map Preview */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Ubicación
                </Label>
                <div className="relative">
                  <LocationInput
                    value={location}
                    onChange={setLocation}
                    className="h-12 rounded-xl"
                  />
                </div>
                {location && (
                  <Card className="h-24 bg-muted/50 border-dashed flex items-center justify-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Map className="h-5 w-5" />
                      <span className="text-sm">Vista previa del mapa</span>
                    </div>
                  </Card>
                )}
              </div>

              {/* Color Picker*/}
              {selectedType === "event" && (
                <div className="space-y-2">
                  <Label htmlFor="color" className="text-sm font-medium">
                    Color de portada
                  </Label>
                  <div className="flex gap-3">
                    {/* Input de texto para el código Hex */}
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        #
                      </span>
                      <Input
                        id="color"
                        value={color.replace("#", "").toUpperCase()}
                        onChange={(e) => setColor(`#${e.target.value}`)}
                        className="pl-7 font-mono uppercase"
                        maxLength={7}
                      />
                    </div>

                    {/* El cuadradito de color (Trigger del Picker) */}
                    <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-xl border border-input shadow-sm transition-all hover:scale-105 active:scale-95">
                      {/* Fondo dinámico */}
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: color }}
                      />
                      {/* Input nativo invisible pero clickeable */}
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Este color se usará para el fondo de la tarjeta.
                  </p>
                </div>
              )}

              {/* Date Inputs - Only for Events */}
              {selectedType === "event" && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Fechas</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">
                        Inicio
                      </span>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-12 rounded-xl pl-10 text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Fin</span>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="h-12 rounded-xl pl-10 text-sm"
                          min={startDate}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Step 3: Category Management with Multi-User Assignment */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Crea categorías para organizar los ítems que necesitarás. Asigna
                responsables a cada ítem.
              </p>

              {/* Add New Category */}
              <Card className="p-3 border-dashed bg-muted/20">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FolderPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nueva categoría (ej: Ropa, Documentos...)"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addCategory()}
                      className="h-11 rounded-xl pl-10"
                    />
                  </div>
                  <Button
                    onClick={addCategory}
                    disabled={!newCategoryName.trim()}
                    size="icon"
                    className="h-11 w-11 rounded-xl shrink-0"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </Card>

              {/* Categories List */}
              {categories.length === 0 ? (
                <Card className="p-6 border-dashed bg-muted/10 text-center">
                  <FolderPlus className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aún no has creado categorías.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Las categorías te ayudan a organizar los ítems de tu evento.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className={cn(
                        "p-3 space-y-3 transition-all",
                        expandedCategoryId === category.id &&
                          "ring-2 ring-primary/20",
                      )}
                    >
                      {/* Category Header */}
                      <div className="flex items-center gap-2">
                        {editingCategoryId === category.id ? (
                          <>
                            <Input
                              value={editingCategoryName}
                              onChange={(e) =>
                                setEditingCategoryName(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && updateCategory(category.id)
                              }
                              className="h-9 flex-1 rounded-lg"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9"
                              onClick={() => updateCategory(category.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9"
                              onClick={() => {
                                setEditingCategoryId(null);
                                setEditingCategoryName("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <button
                              className="flex-1 text-left"
                              onClick={() =>
                                setExpandedCategoryId(
                                  expandedCategoryId === category.id
                                    ? null
                                    : category.id,
                                )
                              }
                            >
                              <h4 className="font-semibold text-foreground">
                                {category.name}
                              </h4>
                            </button>
                            <Badge variant="secondary" className="text-xs">
                              {category.items.length} ítems
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingCategoryId(category.id);
                                setEditingCategoryName(category.name);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {expandedCategoryId === category.id && (
                        <>
                          {/* Items List */}
                          {category.items.length > 0 && (
                            <div className="space-y-1 pl-2 border-l-2 border-muted ml-1">
                              {category.items.map((item) => (
                                <div
                                  key={item.id}
                                  className={cn(
                                    "flex items-center gap-2 py-2 px-2 rounded-lg group",
                                    item.assignedTo.length > 0
                                      ? "bg-primary/5 border border-primary/10"
                                      : "hover:bg-muted/50",
                                  )}
                                >
                                  {editingItemId === item.id ? (
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        value={editingItemName}
                                        onChange={(e) =>
                                          setEditingItemName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                          e.key === "Enter" &&
                                          updateItem(category.id, item.id)
                                        }
                                        className="h-8 rounded-lg text-sm"
                                        autoFocus
                                      />
                                      <CompactUserSelector
                                        selectedUsers={editingItemAssignees}
                                        onToggle={(user) =>
                                          toggleUserAssignment(
                                            user,
                                            editingItemAssignees,
                                            setEditingItemAssignees,
                                          )
                                        }
                                      />
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs rounded-lg"
                                          onClick={() =>
                                            updateItem(category.id, item.id)
                                          }
                                        >
                                          Guardar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 text-xs rounded-lg"
                                          onClick={() => {
                                            setEditingItemId(null);
                                            setEditingItemName("");
                                            setEditingItemAssignees([]);
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <span className="text-sm text-foreground flex-1">
                                        {item.name}
                                      </span>
                                      <AssignedUsersDisplay
                                        users={item.assignedTo}
                                      />
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => startEditItem(item)}
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                        onClick={() =>
                                          deleteItem(category.id, item.id)
                                        }
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Item Form with User Assignment */}
                          <Card className="p-3 border-dashed bg-muted/10 space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nombre del ítem..."
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" && addItem(category.id)
                                }
                                className="h-9 rounded-lg text-sm flex-1"
                              />
                            </div>

                            <CompactUserSelector
                              selectedUsers={newItemAssignees}
                              onToggle={(user) =>
                                toggleUserAssignment(
                                  user,
                                  newItemAssignees,
                                  setNewItemAssignees,
                                )
                              }
                            />

                            <Button
                              onClick={() => addItem(category.id)}
                              disabled={!newItemName.trim()}
                              size="sm"
                              className="w-full h-9 rounded-lg gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Agregar ítem
                            </Button>
                          </Card>
                        </>
                      )}

                      {/* Collapsed hint */}
                      {expandedCategoryId !== category.id &&
                        category.items.length === 0 && (
                          <button
                            onClick={() => setExpandedCategoryId(category.id)}
                            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                          >
                            Toca para agregar ítems
                          </button>
                        )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pt-0 shrink-0">
          {step === 1 ? (
            <Button
              onClick={handleNext}
              disabled={!selectedType}
              size="lg"
              className="w-full h-12 text-base font-semibold rounded-xl gap-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : step === 2 ? (
            selectedType === "event" ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToStep3}
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl gap-2"
              >
                Siguiente: Categorías
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!title.trim()}
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl"
              >
                Crear Rutina
              </Button>
            )
          ) : (
            <div className="space-y-2">
              <Button
                onClick={handleCreate}
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-xl"
              >
                Crear Evento
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Puedes seguir agregando categorías después de crear el evento
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
