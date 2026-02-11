import { db } from "@/db";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  collaborators,
  routineCompletions,
  events,
  checklistCategories,
} from "@/db/schema";

export type DashboardEvent = {
  id: string;
  title: string;
  type: "event" | "routine";
  startDate: Date;
  endDate: Date | null;
  color: string;
  location: string | null;
  isCompletedToday?: boolean;
};

export async function getDashboardEvents(userId: string) {
  try {
    const userCollaborations = await db.query.collaborators.findMany({
      where: eq(collaborators.userId, userId),
      with: { event: true },
    });

    const events = userCollaborations
      .map((c) => c.event)
      .filter((e) => e !== null);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todaysCompletions = await db.query.routineCompletions.findMany({
      where: and(
        eq(routineCompletions.userId, userId),
        gte(routineCompletions.completedAt, startOfDay),
      ),
    });

    const completedIds = new Set(todaysCompletions.map((c) => c.routineId));

    const enrichedEvents = events.map((event) => ({
      ...event,
      isCompletedToday: completedIds.has(event.id),
    }));

    return enrichedEvents.sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime(),
    );
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    return [];
  }
}

// ... tus otros imports (db, eq, etc) ...
// Asegúrate de importar 'events' y 'checklistCategories' si no están

// Definimos un tipo complejo para que TypeScript entienda la estructura anidada
export type EventWithDetails = Awaited<ReturnType<typeof getEventById>>;

export async function getEventById(eventId: string) {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        // 1. Traemos las categorías y sus items ordenados
        checklistCategories: {
          with: {
            items: {
              orderBy: (items, { asc }) => [asc(items.priority)], // Opcional: orden
            },
          },
        },
        // 2. Traemos los colaboradores y sus datos de usuario (nombre, avatar)
        collaborators: {
          with: {
            user: true,
          },
        },
        memories: {
          with: {
            reactions: true,
            uploadedBy: true,
          },
          orderBy: (memories, { desc }) => [desc(memories.createdAt)],
        },
      },
    });

    return event;
  } catch (error) {
    console.error("Error obteniendo detalle del evento:", error);
    return undefined;
  }
}
