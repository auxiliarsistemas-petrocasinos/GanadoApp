import { z } from 'zod';

export const loteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  fecha_inicio: z.coerce.date().max(new Date(), "La fecha no puede ser futura"),
  cantidad_inicial: z.coerce
    .number()
    .int()
    .min(1, "MÃ­nimo 1 gallina")
    .max(1_000_000, "Cantidad demasiado alta"),
  activo: z.boolean().default(true),
});

export const registroGallinasSchema = z
  .object({
    lote_id: z.string().uuid("Lote invÃ¡lido"),
    fecha: z.coerce.date().max(new Date(), "La fecha no puede ser futura"),

    huevos: z.coerce
      .number()
      .int("Debe ser nÃºmero entero")
      .nonnegative("No puede haber huevos negativos")
      .max(1_000_000, "Valor demasiado alto"),

    muertes: z.coerce
      .number()
      .int("Debe ser nÃºmero entero")
      .nonnegative("No puede haber muertes negativas")
      .max(1_000_000, "Valor demasiado alto"),

    alimento_bultos_gastados: z.coerce
      .number()
      .nonnegative("No puede ser negativo")
      .max(100_000, "Valor demasiado alto")
      .default(0),

    alimento_bultos_ingresados: z.coerce
      .number()
      .nonnegative("No puede ser negativo")
      .max(100_000, "Valor demasiado alto")
      .default(0),

    notas: z.string().max(500, "MÃ¡ximo 500 caracteres").optional(),
  })
  .refine((data) => data.huevos >= 0, {
    message: "Los huevos no pueden ser negativos",
    path: ["huevos"],
  });

