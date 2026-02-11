"use server";

import { db } from "@/db";
import { memories, memoryReactions } from "@/db/schema";
import { auth } from "@/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// 1. Guardar nueva foto
export async function uploadMemory(eventId: string, url: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await db.insert(memories).values({
    eventId,
    url,
    uploadedById: session.user.id,
  });

  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

// 2. Toggle de Reacción (Si existe la quita, si no la pone o la cambia)
export async function toggleReaction(
  memoryId: string,
  emoji: string,
  path: string,
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };
  const userId = session.user.id;

  const existing = await db.query.memoryReactions.findFirst({
    where: and(
      eq(memoryReactions.memoryId, memoryId),
      eq(memoryReactions.userId, userId),
    ),
  });

  if (existing) {
    if (existing.emoji === emoji) {
      // Quitar reacción
      await db
        .delete(memoryReactions)
        .where(
          and(
            eq(memoryReactions.memoryId, memoryId),
            eq(memoryReactions.userId, userId),
          ),
        );
    } else {
      // Cambiar emoji
      await db
        .update(memoryReactions)
        .set({ emoji })
        .where(
          and(
            eq(memoryReactions.memoryId, memoryId),
            eq(memoryReactions.userId, userId),
          ),
        );
    }
  } else {
    // Nueva reacción
    await db.insert(memoryReactions).values({ memoryId, userId, emoji });
  }

  revalidatePath(path);
  return { success: true };
}
