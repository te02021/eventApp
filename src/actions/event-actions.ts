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

const getFixedDate = (
  dateInput: Date | string,
  hours: number,
  minutes: number,
  seconds: number,
) => {
  const d = new Date(dateInput);

  // 1. Obtenemos los componentes "nominales" (lo que el usuario eligió en el input)
  // getTimezoneOffset nos da la diferencia en minutos. La sumamos para volver al valor "puro".
  const timeZoneOffsetMs = d.getTimezoneOffset() * 60000;
  const nominalDate = new Date(d.getTime() + timeZoneOffsetMs);

  // 2. Construimos la fecha en UTC con esos componentes nominales y la hora deseada
  return new Date(
    Date.UTC(
      nominalDate.getFullYear(),
      nominalDate.getMonth(),
      nominalDate.getDate(),
      hours,
      minutes,
      seconds,
    ),
  );
};

export async function updateEvent(eventId: string, data: UpdateEventData) {
  try {
    const startDate = getFixedDate(data.startDate, 0, 0, 0);
    const endDate = data.endDate
      ? getFixedDate(data.endDate, 23, 59, 59)
      : getFixedDate(data.startDate, 23, 59, 59);
    await db
      .update(events)
      .set({
        title: data.title,
        location: data.location,
        startDate,
        endDate,
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
    const startDate = getFixedDate(validateData.data.startDate, 0, 0, 0);
    const endDate = validateData.data.endDate
      ? getFixedDate(validateData.data.endDate, 23, 59, 59)
      : getFixedDate(validateData.data.startDate, 23, 59, 59);
    await db.transaction(async (tx) => {
      const [newEvent] = await tx
        .insert(events)
        .values({
          title: validateData.data.title,
          description: validateData.data.description,
          color: validateData.data.color,
          type: validateData.data.type ?? "event",
          startDate,
          location: validateData.data.location,
          endDate,
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
