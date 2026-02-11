"use server";

import { auth } from "@/auth";
import {
  CreateEventInput,
  createEventSchema,
} from "@/lib/validators/event-validator";
import { db } from "@/db";
import {
  checklistCategories,
  checklistItems,
  collaborators,
  events,
} from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

interface UpdateEventData {
  title: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  color: string;
}

export async function updateEvent(eventId: string, data: UpdateEventData) {
  try {
    await db
      .update(events)
      .set({
        title: data.title,
        location: data.location,
        startDate: data.startDate,
        endDate: data.endDate,
        color: data.color,
      })
      .where(eq(events.id, eventId));

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error actualizando evento:", error);
    return { success: false, error: "No se pudo actualizar el evento" };
  }
}

// 2. ELIMINAR EVENTO
export async function deleteEvent(eventId: string) {
  try {
    await db.delete(events).where(eq(events.id, eventId));

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error eliminando evento:", error);
    return { success: false, error: "No se pudo eliminar el evento" };
  }
}

export default async function createEvent(rawData: CreateEventInput) {
  const session = await auth();

  if (!session?.user.id) {
    return { success: false, error: "Se requiere autenticacion" };
  }

  const validateData = createEventSchema.safeParse(rawData);

  if (!validateData.success) {
    return { success: false, error: "Error de validacion de datos" };
  }

  try {
    await db.transaction(async (tx) => {
      const [newEvent] = await tx
        .insert(events)
        .values({
          title: validateData.data.title,
          description: validateData.data.description,
          color: validateData.data.color,
          type: validateData.data.type ?? "event",
          startDate: validateData.data.startDate,
          location: validateData.data.location,
          endDate: validateData.data.endDate ? validateData.data.endDate : null,
          createdById: session.user.id,
        })
        .returning({ id: events.id });
      await tx.insert(collaborators).values({
        eventId: newEvent.id,
        userId: session.user.id,
        role: "admin",
      });

      if (
        validateData.data.categories &&
        validateData.data.categories.length > 0
      ) {
        for (const cat of validateData.data.categories) {
          const [newCategory] = await tx
            .insert(checklistCategories)
            .values({
              eventId: newEvent.id,
              name: cat.name,
            })
            .returning({ id: checklistCategories.id });

          if (cat.items && cat.items.length > 0) {
            const itemsToInsert = cat.items.map((item) => ({
              categoryId: newCategory.id,
              title: item.title,
              isCompleted: false,
              priority: "medium" as const,
            }));
            await tx.insert(checklistItems).values(itemsToInsert);
          }
        }
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Ocurrio un error al crear evento", error);
    return { success: false, error: "Error interno al crear evento" };
  }
}
