import { differenceInDays, subDays, startOfWeek, endOfWeek, format } from 'date-fns';

export interface RegistroGallinas {
  id: string;
  lote_id: string;
  fecha: string;
  cantidad_gallinas: number;
  huevos: number;
  muertes: number;
  alimento_bultos_gastados: number;
  alimento_bultos_ingresados: number;
  notas?: string;
  created_at: string;
  updated_at: string;
}

export interface KPIs {
  produccionDiaria: number;
  promedioSemanal: number;
  mortalidad: string;
  eficiencia: string;
  tendencia: string;
  consumoSemanal: number;
  alertas: Array<{ tipo: string; valor: string }>;
}

export interface DatosGraficas {
  consumoAlimento: Array<{ fecha: string; gastado: number; stock: number }>;
  produccionSemanal: Array<{ semana: string; huevos: number }>;
  produccionAcumulada: Array<{ fecha: string; acumulado: number }>;
  mortalidadDiaria: Array<{ fecha: string; porcentaje: number }>;
}

// Convertir string "YYYY-MM-DD" a un Date local sin desfases de huso horario
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function calcularKPIs(registros: RegistroGallinas[]): KPIs {
  // Usar la fecha del registro más reciente como referencia para poder visualizar datos de cualquier época
  const hoy = registros.length > 0 ? parseLocalDate(registros[0].fecha) : new Date();

  // Últimos 7 días respecto al registro más reciente
  const ultimaSemana = registros.filter(
    (r) => differenceInDays(hoy, parseLocalDate(r.fecha)) <= 7
  );

  // Semana anterior (8-14 días respecto al registro más reciente)
  const semanaAnterior = registros.filter(
    (r) => {
      const dias = differenceInDays(hoy, parseLocalDate(r.fecha));
      return dias > 7 && dias <= 14;
    }
  );

  // Producción del último registro
  const produccionDiaria = registros.length > 0 ? registros[0].huevos : 0;

  // Promedio semanal
  const promedioSemanal =
    ultimaSemana.length > 0
      ? Math.round(
          ultimaSemana.reduce((sum, r) => sum + r.huevos, 0) /
            ultimaSemana.length
        )
      : 0;

  // Mortalidad semanal (%)
  const totalMuertes = ultimaSemana.reduce((sum, r) => sum + r.muertes, 0);
  const promGallinas =
    ultimaSemana.length > 0
      ? ultimaSemana.reduce((sum, r) => sum + r.cantidad_gallinas, 0) /
        ultimaSemana.length
      : 0;
  const mortalidad =
    promGallinas > 0
      ? ((totalMuertes / promGallinas) * 100).toFixed(2)
      : '0.00';

  // Eficiencia alimento (huevos por bulto)
  const totalAlimento = ultimaSemana.reduce(
    (sum, r) => sum + Number(r.alimento_bultos_gastados || 0),
    0
  );
  const totalHuevos = ultimaSemana.reduce((sum, r) => sum + r.huevos, 0);
  const eficiencia =
    totalAlimento > 0 ? (totalHuevos / totalAlimento).toFixed(2) : '0.00';

  // Consumo semanal
  const consumoSemanal = totalAlimento;

  // Tendencia (vs semana anterior)
  const promedioAnterior =
    semanaAnterior.length > 0
      ? semanaAnterior.reduce((sum, r) => sum + r.huevos, 0) /
        semanaAnterior.length
      : 0;
  const tendencia =
    promedioAnterior > 0
      ? (
          ((promedioSemanal - promedioAnterior) / promedioAnterior) *
          100
        ).toFixed(1)
      : '0.0';

  // Alertas
  const alertas: Array<{ tipo: string; valor: string }> = [];
  if (parseFloat(mortalidad) > 10) {
    alertas.push({ tipo: 'ALTA_MORTALIDAD', valor: mortalidad });
  }
  // Alerta si la eficiencia es menor a 280 huevos por bulto (aprox 7 huevos/kg con bultos de 40kg)
  if (parseFloat(eficiencia) < 280 && parseFloat(eficiencia) > 0) {
    alertas.push({ tipo: 'BAJA_EFICIENCIA', valor: eficiencia });
  }

  return {
    produccionDiaria,
    promedioSemanal,
    mortalidad,
    eficiencia,
    tendencia,
    consumoSemanal,
    alertas,
  };
}

export function calcularDatosGraficas(
  registros: RegistroGallinas[]
): DatosGraficas {
  // Calcular stock acumulado desde el inicio (de más antiguo a más nuevo)
  const registrosCronologico = [...registros].reverse();
  let stockAcumulado = 0;
  
  const historialAlimentoCompleto = registrosCronologico.map((r) => {
    stockAcumulado += Number(r.alimento_bultos_ingresados || 0) - Number(r.alimento_bultos_gastados || 0);
    return {
      fecha: r.fecha,
      gastado: Number(r.alimento_bultos_gastados || 0),
      stock: stockAcumulado,
    };
  });

  // Tomar los últimos 30 días cronológicos para la gráfica
  const consumoAlimento = historialAlimentoCompleto
    .slice(-30)
    .map((item) => ({
      fecha: format(parseLocalDate(item.fecha), 'dd/MM'),
      gastado: item.gastado,
      stock: item.stock,
    }));

  // Producción acumulada (mes actual)
  let acumulado = 0;
  const produccionAcumulada = [...registros]
    .slice(0, 30)
    .reverse()
    .map((r) => {
      acumulado += r.huevos;
      return {
        fecha: format(parseLocalDate(r.fecha), 'dd/MM'),
        acumulado,
      };
    });

  // Mortalidad diaria
  const mortalidadDiaria = [...registros]
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      fecha: format(parseLocalDate(r.fecha), 'dd/MM'),
      porcentaje:
        r.cantidad_gallinas > 0
          ? parseFloat(
              ((r.muertes / r.cantidad_gallinas) * 100).toFixed(2)
            )
          : 0,
    }));

  // Producción por semana (últimas 8 semanas) - agrupar registros
  const semanasMap = new Map<string, number>();
  registros.slice(0, 56).forEach((r) => {
    const fecha = parseLocalDate(r.fecha);
    const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 });
    const key = format(inicioSemana, 'dd/MM');
    semanasMap.set(key, (semanasMap.get(key) || 0) + r.huevos);
  });
  const produccionSemanal = Array.from(semanasMap.entries())
    .slice(0, 8)
    .reverse()
    .map(([semana, huevos]) => ({ semana, huevos }));

  return {
    consumoAlimento,
    produccionSemanal,
    produccionAcumulada,
    mortalidadDiaria,
  };
}
