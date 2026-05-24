import { z } from 'zod';
import { isWeekend } from 'date-fns';

export const loteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio").max(255),
  fecha_inicio: z.coerce.date().max(new Date(), "La fecha no puede ser futura"),
  cantidad_inicial: z.coerce.number().int().min(1, "Mínimo 1 gallina"),
  activo: z.boolean().default(true),
});

export const registroGallinasSchema = z.object({
  lote_id: z.string().uuid("Lote inválido"),
  fecha: z.coerce
    .date()
    .max(new Date(), "La fecha no puede ser futura"),
    // Opcional: .refine((date) => !isWeekend(date), "La fecha debe ser día de semana")
  
  huevos: z.coerce
    .number()
    .int("Debe ser número entero")
    .nonnegative("No puede haber huevos negativos"),
  
  muertes: z.coerce
    .number()
    .int("Debe ser número entero")
    .nonnegative("No puede haber muertes negativas"),
  
  alimento_bultos_gastados: z.coerce
    .number()
    .nonnegative("No puede ser negativo")
    .default(0),
  
  alimento_bultos_ingresados: z.coerce
    .number()
    .nonnegative("No puede ser negativo")
    .default(0),
  
  notas: z.string().max(500, "Máximo 500 caracteres").optional(),
})
.refine(
  (data) => data.huevos >= 0,
  { message: "Los huevos no pueden ser negativos", path: ["huevos"] }
);
