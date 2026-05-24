'use client'

import { useEffect, useState, useCallback } from 'react'
import { obtenerDatosDashboard } from '@/actions/registros'
import { obtenerLotes } from '@/actions/lotes'
import { calcularKPIs, calcularDatosGraficas, type RegistroGallinas, type KPIs, type DatosGraficas } from '@/lib/calculations'
import { Egg, Skull, TrendingUp, Wheat, AlertTriangle } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function KpiCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  alert,
}: {
  title: string
  value: string | number
  unit?: string
  icon: any
  trend?: string
  alert?: boolean
}) {
  return (
    <div className={`rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md ${alert ? 'border-destructive' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={`h-5 w-5 ${alert ? 'text-destructive' : 'text-secondary'}`} />
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">
          {value}
          {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
        </p>
        {trend && (
          <p className={`mt-1 text-xs ${parseFloat(trend) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {parseFloat(trend) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(trend))}% vs semana anterior
          </p>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [lotes, setLotes] = useState<any[]>([])
  const [selectedLoteId, setSelectedLoteId] = useState<string>('')
  
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [graficas, setGraficas] = useState<DatosGraficas | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLotes = async () => {
    try {
      const res = await obtenerLotes(true) // Solo activos por defecto
      if (res.success && res.data) {
        setLotes(res.data)
        if (res.data.length > 0) {
          setSelectedLoteId(res.data[0].id)
        } else {
          setLoading(false)
        }
      } else {
        console.error('Error al cargar lotes:', res.error)
        setLoading(false)
      }
    } catch (e) {
      console.error('Error fetchLotes:', e)
      setLoading(false)
    }
  }

  const fetchData = useCallback(async () => {
    if (!selectedLoteId) return
    
    setLoading(true)
    const result = await obtenerDatosDashboard(selectedLoteId)
    if (result.success && result.data) {
      const registros = result.data as RegistroGallinas[]
      setKpis(calcularKPIs(registros))
      setGraficas(calcularDatosGraficas(registros))
    }
    setLoading(false)
  }, [selectedLoteId])

  useEffect(() => {
    fetchLotes()
  }, [])

  useEffect(() => {
    fetchData()
    // Auto-refresh cada 60 segundos
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading && !selectedLoteId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  if (lotes.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">No tienes ningún Lote Activo.</p>
        <p className="text-sm text-muted-foreground">
          Ve a <span className="font-semibold text-primary">Lotes</span> y crea tu primer lote para comenzar.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen de producción avícola por lote</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Lote Activo:</span>
          <Select value={selectedLoteId} onValueChange={(v) => { if (v) setSelectedLoteId(v) }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Seleccionar lote" />
            </SelectTrigger>
            <SelectContent>
              {lotes.map(lote => (
                <SelectItem key={lote.id} value={lote.id}>{lote.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && selectedLoteId && (
        <div className="mb-4 text-sm text-muted-foreground">Actualizando datos...</div>
      )}

      {!kpis || !graficas ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <p className="text-muted-foreground">No hay datos disponibles para este lote.</p>
          <p className="text-sm text-muted-foreground">
            Ve a <span className="font-semibold text-primary">Registros</span> y agrega registros.
          </p>
        </div>
      ) : (
        <>
          {/* Alertas */}
          {kpis.alertas.length > 0 && (
            <div className="mb-6 space-y-2">
              {kpis.alertas.map((alerta, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
              {alerta.tipo === 'ALTA_MORTALIDAD'
                    ? `⚠️ Mortalidad alta: ${alerta.valor}% (superior al 10%)`
                    : `⚠️ Eficiencia baja: ${alerta.valor} huevos/bulto`}
                </div>
              ))}
            </div>
          )}

          {/* KPI Cards */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Producción Diaria"
              value={kpis.produccionDiaria}
              unit="huevos"
              icon={Egg}
              trend={kpis.tendencia}
            />
            <KpiCard
              title="Promedio Semanal"
              value={kpis.promedioSemanal}
              unit="huevos/día"
              icon={TrendingUp}
            />
            <KpiCard
              title="Mortalidad Semanal"
              value={kpis.mortalidad}
              unit="%"
              icon={Skull}
              alert={parseFloat(kpis.mortalidad) > 10}
            />
            <KpiCard
              title="Consumo Semanal"
              value={kpis.consumoSemanal.toFixed(1)}
              unit="bultos"
              icon={Wheat}
            />
          </div>

          {/* Gráficas */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Consumo de Alimento - Dual Line Chart */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Consumo de Alimento (Bultos)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={graficas.consumoAlimento}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    name="Stock"
                    stroke="hsl(142, 71%, 45%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="gastado"
                    name="Gastado"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Producción por semana - Bar Chart */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Producción por Semana</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={graficas.produccionSemanal}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="huevos" fill="hsl(215, 28%, 27%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Producción acumulada - Area Chart */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Producción Acumulada (mes)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={graficas.produccionAcumulada}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="acumulado"
                    stroke="hsl(20, 100%, 57%)"
                    fill="hsl(20, 100%, 57%)"
                    fillOpacity={0.15}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Mortalidad diaria - Line Chart */}
            <div className="rounded-lg border bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold">Mortalidad Diaria (%)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={graficas.mortalidadDiaria}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="porcentaje"
                    stroke="hsl(0, 84.2%, 60.2%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
