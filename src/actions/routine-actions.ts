"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { routineCompletions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function toggleRoutine(routineId: string) {
  const session = await auth();

  if (!session?.user.id) {
    return { success: false, error: "Se requiere autenticacion" };
  }

  const userId = session.user.id;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  //Buscar si ya hay check diario realizado
  try {
    const existingCompletion = await db.query.routineCompletions.findFirst({
      where: and(
        eq(routineCompletions.routineId, routineId),
        eq(routineCompletions.userId, userId),
        gte(routineCompletions.completedAt, startOfDay),
        lte(routineCompletions.completedAt, endOfDay),
      ),
    });
    if (existingCompletion) {
      // 4A. SI YA EXISTE -> Lo borramos (Uncheck)
      await db
        .delete(routineCompletions)
        .where(eq(routineCompletions.id, existingCompletion.id));

      revalidatePath("/");
      return { success: true, action: "unchecked" };
    } else {
      // 4B. SI NO EXISTE -> Lo creamos (Check)
      await db.insert(routineCompletions).values({
        routineId: routineId,
        userId: userId,
      });

      revalidatePath("/");
      return { success: true, action: "checked" };
    }
  } catch (error) {
    console.error("Error al marcar rutina:", error);
    return { success: false, error: "Error de servidor" };
  }
}
