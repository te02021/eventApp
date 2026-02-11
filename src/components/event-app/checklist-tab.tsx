"use client";

import { useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  PackagePlus,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  FolderPlus,
  MoreVertical,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  toggleChecklistItem,
  createChecklistItem,
  createCategory,
  deleteChecklistItem,
  updateCategoryName,
  deleteCategory as deleteCategoryAction,
  updateChecklistItem,
} from "@/actions/checklist-actions";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

type Priority = "alta" | "media" | "baja";

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface ChecklistItemUI {
  id: string;
  name: string;
  priority: Priority;
  completed: boolean;
  assignedTo: User[];
}

interface CategoryUI {
  id: string;
  name: string;
  items: ChecklistItemUI[];
}

interface ChecklistTabProps {
  eventId: string;
  categories: any[];
}

// Event participants - in a real app this would come from the event data
const priorityConfig: Record<
  Priority,
  { bg: string; text: string; label: string }
> = {
  alta: { bg: "bg-red-100", text: "text-red-700", label: "Alta" },
  media: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Media" },
  baja: { bg: "bg-green-100", text: "text-green-700", label: "Baja" },
};

const eventParticipants: User[] = [
  { id: "1", name: "Yo", avatar: "" },
  { id: "2", name: "Invitado", avatar: "" },
];

export function ChecklistTab({
  eventId,
  categories: dbCategories,
}: ChecklistTabProps) {
  const pathname = usePathname();
  const mapPriority = (p: string): Priority => {
    const map: Record<string, Priority> = {
      high: "alta",
      medium: "media",
      low: "baja",
      alta: "alta",
      media: "media",
      baja: "baja",
    };
    return map[p] || "media"; // Si no encuentra nada, devuelve "media" por defecto
  };
  const initialCategories: CategoryUI[] = dbCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item: any) => ({
      id: item.id,
      name: item.title, // DB: title -> UI: name
      priority: mapPriority(item.priority),
      completed: item.isCompleted, // DB: isCompleted -> UI: completed
      assignedTo: [], // DB aún no tiene asignaciones, lo dejamos vacío
    })),
  }));

  const [categories, setCategories] = useState<CategoryUI[]>(initialCategories);

  useEffect(() => {
    setCategories(
      dbCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        items: cat.items.map((item: any) => ({
          id: item.id,
          name: item.title,
          priority: mapPriority(item.priority),
          completed: item.isCompleted,
          assignedTo: [],
        })),
      })),
    );
  }, [dbCategories]);
  const [searchQuery, setSearchQuery] = useState("");

  // Category management state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  // Item management state
  const [addingItemToCategoryId, setAddingItemToCategoryId] = useState<
    string | null
  >(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPriority, setNewItemPriority] = useState<Priority>("media");
  const [newItemAssignees, setNewItemAssignees] = useState<User[]>([]);

  // Edit item modal state
  const [editingItem, setEditingItem] = useState<{
    categoryId: string;
    item: ChecklistItemUI;
  } | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPriority, setEditItemPriority] = useState<Priority>("media");
  const [editItemAssignees, setEditItemAssignees] = useState<User[]>([]);

  // Toggle item completion
  const toggleItem = async (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item,
              ),
            }
          : category,
      ),
    );
    const category = categories.find((c) => c.id === categoryId);
    const item = category?.items.find((i) => i.id === itemId);
    if (!item) return;

    const result = await toggleChecklistItem(itemId, !item.completed, pathname);

    if (!result.success) {
      toast.error("Error al actualizar");
    }
  };

  // Category CRUD
  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      const result = await createCategory(
        eventId,
        newCategoryName.trim(),
        pathname,
      );
      if (result.success) {
        setNewCategoryName("");
        setShowAddCategory(false);
        toast.success("Categoría creada");
      } else {
        toast.error("Error al crear categoría");
      }
    }
  };

  const handleAddItem = async (categoryId: string) => {
    if (newItemName.trim()) {
      // Optimistic update local (opcional, aquí esperamos al server mejor)
      const result = await createChecklistItem(
        categoryId,
        newItemName.trim(),
        newItemPriority,
        pathname,
      );

      if (result.success) {
        resetAddItemForm();
        toast.success("Ítem agregado");
      } else {
        toast.error("Error al agregar ítem");
      }
    }
  };

  const handleDeleteItem = async (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat,
      ),
    );

    const result = await deleteChecklistItem(itemId, pathname);
    if (!result.success) toast.error("Error al eliminar");
    else toast.success("Ítem eliminado");
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (editingCategoryName.trim()) {
      // Optimistic update
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, name: editingCategoryName.trim() }
            : cat,
        ),
      );

      const result = await updateCategoryName(
        categoryId,
        editingCategoryName.trim(),
        pathname,
      );

      setEditingCategoryId(null);
      setEditingCategoryName("");

      if (result.success) toast.success("Categoría actualizada");
      else toast.error("Error al actualizar categoría");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    // Confirmación simple
    if (
      !confirm("¿Estás seguro? Se borrarán todos los ítems de esta categoría.")
    )
      return;

    // Optimistic delete
    setCategories(categories.filter((cat) => cat.id !== categoryId));

    const result = await deleteCategoryAction(categoryId, pathname);

    if (result.success) toast.success("Categoría eliminada");
    else toast.error("Error al eliminar categoría");
  };

  const handleSaveEditItem = async () => {
    if (editingItem && editItemName.trim()) {
      // Optimistic Update
      setCategories(
        categories.map((cat) =>
          cat.id === editingItem.categoryId
            ? {
                ...cat,
                items: cat.items.map((item) =>
                  item.id === editingItem.item.id
                    ? {
                        ...item,
                        name: editItemName.trim(),
                        priority: editItemPriority,
                        assignedTo: editItemAssignees,
                      }
                    : item,
                ),
              }
            : cat,
        ),
      );

      const result = await updateChecklistItem(
        editingItem.item.id,
        editItemName.trim(),
        editItemPriority,
        pathname,
      );

      closeEditModal();

      if (result.success) toast.success("Ítem actualizado");
      else toast.error("Error al actualizar ítem");
    }
  };

  const resetAddItemForm = () => {
    setAddingItemToCategoryId(null);
    setNewItemName("");
    setNewItemPriority("media");
    setNewItemAssignees([]);
  };

  const openEditModal = (categoryId: string, item: ChecklistItemUI) => {
    setEditingItem({ categoryId, item });
    setEditItemName(item.name);
    setEditItemPriority(item.priority);
    setEditItemAssignees(item.assignedTo);
  };
  const closeEditModal = () => {
    setEditingItem(null);
    setEditItemName("");
    setEditItemPriority("media");
    setEditItemAssignees([]);
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

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter(
      (category) =>
        category.items.length > 0 ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.completed).length,
    0,
  );

  // User selector component
  const UserSelector = ({
    selectedUsers,
    onToggle,
    compact = false,
  }: {
    selectedUsers: User[];
    onToggle: (user: User) => void;
    compact?: boolean;
  }) => (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <span>Asignar a:</span>
      </div>
      <div className={cn("flex flex-wrap gap-2", compact && "gap-1")}>
        {eventParticipants.map((user) => {
          const isSelected = selectedUsers.some((u) => u.id === user.id);
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onToggle(user)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
                compact && "px-2 py-1.5 rounded-lg",
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 bg-background",
              )}
            >
              <Avatar className={cn("h-6 w-6", compact && "h-5 w-5")}>
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className={cn("text-sm font-medium", compact && "text-xs")}>
                {user.name.split(" ")[0]}
              </span>
              {isSelected && (
                <Check
                  className={cn("h-4 w-4 text-primary", compact && "h-3 w-3")}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Assigned users display component
  const AssignedUsersDisplay = ({ users }: { users: User[] }) => {
    if (users.length === 0) return null;

    return (
      <div
        className="flex items-center -space-x-2"
        title={users.map((u) => u.name).join(", ")}
      >
        {users.slice(0, 3).map((user) => (
          <Avatar
            key={user.id}
            className="h-6 w-6 border-2 border-background ring-2 ring-primary/20"
          >
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs bg-primary/10">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
        ))}
        {users.length > 3 && (
          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <span className="text-xs font-medium">+{users.length - 3}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Search Bar with Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ítems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-muted/50 border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Progress Summary */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">
          {completedItems} de {totalItems} ítems completados
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-primary"
          onClick={() => setShowAddCategory(true)}
        >
          <FolderPlus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <Card className="p-3 border-primary/50 bg-primary/5">
          <div className="flex gap-2">
            <Input
              placeholder="Nombre de la categoría..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              className="h-10 rounded-lg"
              autoFocus
            />
            <Button
              size="icon"
              className="h-10 w-10 rounded-lg"
              onClick={handleAddCategory}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-lg"
              onClick={() => {
                setShowAddCategory(false);
                setNewCategoryName("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {categories.length === 0 && !showAddCategory ? (
        <Card className="p-8 border-dashed border-2 bg-muted/20">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <PackagePlus className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground text-lg mb-2">
              Sin ítems aún
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Comienza creando categorías y agregando ítems a tu checklist.
            </p>
            <Button
              size="lg"
              className="h-12 px-6 rounded-xl"
              onClick={() => setShowAddCategory(true)}
            >
              Crear categoría
            </Button>
          </div>
        </Card>
      ) : (
        /* Accordion Categories */
        <Accordion
          type="multiple"
          defaultValue={categories.map((c) => c.id)}
          className="space-y-3"
        >
          {filteredCategories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border border-border rounded-xl px-4 bg-card overflow-hidden"
            >
              <div className="flex items-center">
                {editingCategoryId === category.id ? (
                  /* Edit Category Name Input */
                  <div className="flex flex-1 items-center gap-2 py-4">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleUpdateCategory(category.id);
                        if (e.key === "Escape") {
                          setEditingCategoryId(null);
                          setEditingCategoryName("");
                        }
                      }}
                      className="h-8 rounded-lg"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateCategory(category.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategoryId(null);
                        setEditingCategoryName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <AccordionTrigger className="py-4 hover:no-underline flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">
                        {category.name}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {category.items.filter((i) => i.completed).length}/
                        {category.items.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                )}

                {/* Category Actions Dropdown */}
                {editingCategoryId !== category.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 mr-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingCategoryId(category.id);
                          setEditingCategoryName(category.name);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar nombre
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar categoría
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <AccordionContent className="pb-3">
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-center gap-3 py-3 px-2 rounded-lg transition-colors group",
                        item.assignedTo.length > 0
                          ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => toggleItem(category.id, item.id)}
                        className="h-5 w-5 rounded-md"
                      />
                      <label
                        htmlFor={item.id}
                        className={cn(
                          "flex-1 text-sm cursor-pointer transition-all",
                          item.completed &&
                            "text-muted-foreground line-through",
                        )}
                      >
                        {item.name}
                      </label>
                      <div className="flex items-center gap-2">
                        <AssignedUsersDisplay users={item.assignedTo} />
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-medium",
                            priorityConfig[item.priority].bg,
                            priorityConfig[item.priority].text,
                          )}
                        >
                          {priorityConfig[item.priority].label}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openEditModal(category.id, item)}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Editar ítem
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                handleDeleteItem(category.id, item.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar ítem
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {/* Add Item Form */}
                  {addingItemToCategoryId === category.id ? (
                    <Card className="p-4 mt-3 border-primary/30 bg-primary/5 space-y-4">
                      <div className="space-y-3">
                        <Input
                          placeholder="Nombre del ítem..."
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="h-11 rounded-lg"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Select
                            value={newItemPriority}
                            onValueChange={(v) =>
                              setNewItemPriority(v as Priority)
                            }
                          >
                            <SelectTrigger className="w-full h-11 rounded-lg">
                              <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alta">Alta</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                              <SelectItem value="baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Selector de Usuarios (Visual por ahora) */}
                          <div className="flex-1">
                            {/* Puedes poner el UserSelector aquí si quieres habilitarlo al crear */}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          className="flex-1 h-10 rounded-lg"
                          onClick={() => handleAddItem(category.id)}
                          disabled={!newItemName.trim()}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Agregar ítem
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-10 rounded-lg"
                          onClick={resetAddItemForm}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-10 w-full justify-start text-muted-foreground hover:text-foreground rounded-lg"
                      onClick={() => setAddingItemToCategoryId(category.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar ítem
                    </Button>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      {/* Edit Item Modal */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(open) => !open && closeEditModal()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Editar ítem
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                placeholder="Nombre del ítem..."
                className="h-11 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Prioridad</label>
              <Select
                value={editItemPriority}
                onValueChange={(v) => setEditItemPriority(v as Priority)}
              >
                <SelectTrigger className="w-full h-11 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Alta
                    </span>
                  </SelectItem>
                  <SelectItem value="media">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      Media
                    </span>
                  </SelectItem>
                  <SelectItem value="baja">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Baja
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Responsables</label>
              <UserSelector
                selectedUsers={editItemAssignees}
                onToggle={(user) =>
                  toggleUserAssignment(
                    user,
                    editItemAssignees,
                    setEditItemAssignees,
                  )
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeEditModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditItem}
              disabled={!editItemName.trim()}
            >
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
