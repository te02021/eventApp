"use server";

import { db } from "@/db";
import { checklistItems, checklistCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Marcar / Desmarcar
export async function toggleChecklistItem(
  itemId: string,
  isCompleted: boolean,
  path: string,
) {
  try {
    await db
      .update(checklistItems)
      .set({ isCompleted })
      .where(eq(checklistItems.id, itemId));

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error("Error toggling item:", error);
    return { success: false, error: "Error al actualizar" };
  }
}

// 2. Crear Ítem
export async function createChecklistItem(
  categoryId: string,
  title: string,
  priority: "alta" | "media" | "baja",
  path: string,
) {
  try {
    const priorityMap: Record<string, "high" | "medium" | "low"> = {
      alta: "high",
      media: "medium",
      baja: "low",
    };
    const dbPriority = priorityMap[priority] || "medium";
    await db.insert(checklistItems).values({
      categoryId,
      title,
      priority: dbPriority,
      isCompleted: false,
    });

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error("Error creating item:", error);
    return { success: false, error: "Error al crear" };
  }
}

export async function updateChecklistItem(
  itemId: string,
  title: string,
  priority: "alta" | "media" | "baja",
  path: string,
) {
  try {
    const priorityMap: Record<string, "high" | "medium" | "low"> = {
      alta: "high",
      media: "medium",
      baja: "low",
    };

    await db
      .update(checklistItems)
      .set({
        title,
        priority: priorityMap[priority] || "medium",
      })
      .where(eq(checklistItems.id, itemId));

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al actualizar ítem" };
  }
}

// 3. Crear Categoría
export async function createCategory(
  eventId: string,
  name: string,
  path: string,
) {
  try {
    await db.insert(checklistCategories).values({
      eventId,
      name,
    });
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error creando categoría" };
  }
}

export async function updateCategoryName(
  categoryId: string,
  name: string,
  path: string,
) {
  try {
    await db
      .update(checklistCategories)
      .set({ name })
      .where(eq(checklistCategories.id, categoryId));

    revalidatePath(path);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error actualizando categoría" };
  }
}

export async function deleteCategory(categoryId: string, path: string) {
  try {
    await db
      .delete(checklistCategories)
      .where(eq(checklistCategories.id, categoryId));
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error eliminando categoría" };
  }
}

// 4. Eliminar Item
export async function deleteChecklistItem(itemId: string, path: string) {
  try {
    await db.delete(checklistItems).where(eq(checklistItems.id, itemId));
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
