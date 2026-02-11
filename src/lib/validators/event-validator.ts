import z from "zod";

const checklistItemSchema = z.object({
  title: z.string().min(1, "Se requiere 1 caracter como minimo"),
  //assignedTo
});

const checklistCategorySchema = z.object({
  name: z.string(),
  items: z.array(checklistItemSchema),
});

export const createEventSchema = z.object({
  title: z.string().min(3, "Se requieren 3 caracteres como minimo"),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  type: z.enum(["event", "routine"]).nullable(),
  startDate: z.coerce.date({
    required_error: "La fecha de inicio es requerida",
    invalid_type_error: "Formato de fecha inválido",
  }),
  endDate: z.coerce.date().optional().nullable(),
  location: z.string().optional(),
  categories: z.array(checklistCategorySchema).optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
