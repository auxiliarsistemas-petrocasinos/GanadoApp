'use client'

import { useActionState, useEffect, useState, useCallback } from 'react'
import { crearRegistro, editarRegistro, obtenerRegistros, eliminarRegistro } from '@/actions/registros'
import { obtenerLotes } from '@/actions/lotes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSection } from '@/components/ui/form-section'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Egg, Skull, Wheat } from 'lucide-react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Registro {
  id: string
  lote_id: string
  lotes?: { nombre: string }
  fecha: string
  cantidad_gallinas: number
  huevos: number
  muertes: number
  alimento_bultos_gastados: number
  alimento_bultos_ingresados: number
  notas?: string
}

function RegistroForm({
  registro,
  lotesActivos,
  open,
  onClose,
  onSuccess,
}: {
  registro?: Registro | null
  lotesActivos: any[]
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const isEditing = !!registro
  const action = isEditing ? editarRegistro : crearRegistro
  const [state, formAction, pending] = useActionState(action, null)

  useEffect(() => {
    if (state?.success && open) {
      onSuccess()
    }
  }, [state?.success, open, onSuccess])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle>
            {isEditing ? 'Editar Registro Diario' : 'Nuevo Registro Diario'}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="px-8 pb-8 space-y-0">
          {isEditing && <input type="hidden" name="id" value={registro.id} />}

          {state?.error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
              {state.error}
              {(state.formErrors?.length ?? 0) > 0 && (
                <ul className="mt-1 list-inside list-disc">
                  {state.formErrors?.map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <Label htmlFor="lote_id">Lote de Producción</Label>
              <select
                id="lote_id"
                name="lote_id"
                required
                defaultValue={registro?.lote_id || (lotesActivos.length > 0 ? lotesActivos[0].id : '')}
                className="h-[46px] w-full rounded-xl bg-[#F8FAFC] px-4 py-2 text-[15px] font-medium text-slate-800 outline-none focus:ring-2 focus:ring-secondary/40"
              >
                <option value="" disabled>Seleccione un Lote</option>
                {lotesActivos.map(lote => (
                  <option key={lote.id} value={lote.id}>{lote.nombre}</option>
                ))}
              </select>
              {state?.fieldErrors?.lote_id && (
                <p className="text-xs text-red-500">{state.fieldErrors.lote_id[0]}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                name="fecha"
                defaultValue={registro?.fecha || format(new Date(), 'yyyy-MM-dd')}
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
              {state?.fieldErrors?.fecha && (
                <p className="text-xs text-red-500">{state.fieldErrors.fecha[0]}</p>
              )}
            </div>
          </div>

          <FormSection title="PRODUCCIÓN">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="huevos">Huevos Producidos</Label>
                <Input
                  id="huevos"
                  name="huevos"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.,\s]*"
                  defaultValue={registro?.huevos ?? ''}
                  placeholder="Ej: 18.500"
                  required
                />
                {state?.fieldErrors?.huevos && <p className="text-xs text-red-500">{state.fieldErrors.huevos[0]}</p>}
              </div>
              <div className="space-y-3">
                <Label htmlFor="muertes">Aves Muertas</Label>
                <Input
                  id="muertes"
                  name="muertes"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9.,\s]*"
                  defaultValue={registro?.muertes ?? ''}
                  placeholder="Ej: 0"
                  required
                />
                {state?.fieldErrors?.muertes && <p className="text-xs text-red-500">{state.fieldErrors.muertes[0]}</p>}
              </div>
            </div>
          </FormSection>

          <FormSection title="ALIMENTACIÓN">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="alimento_bultos_gastados">Bultos Gastados (hoy)</Label>
                <Input
                  id="alimento_bultos_gastados"
                  name="alimento_bultos_gastados"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.,\s]*"
                  defaultValue={registro?.alimento_bultos_gastados ?? ''}
                  placeholder="Ej: 1.5"
                  required
                />
                {state?.fieldErrors?.alimento_bultos_gastados && (
                  <p className="text-xs text-red-500">{state.fieldErrors.alimento_bultos_gastados[0]}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="alimento_bultos_ingresados">Bultos Ingresados (compra/entrada)</Label>
                <Input
                  id="alimento_bultos_ingresados"
                  name="alimento_bultos_ingresados"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9.,\s]*"
                  defaultValue={registro?.alimento_bultos_ingresados ?? ''}
                  placeholder="Ej: 300 (opcional)"
                />
                {state?.fieldErrors?.alimento_bultos_ingresados && (
                  <p className="text-xs text-red-500">{state.fieldErrors.alimento_bultos_ingresados[0]}</p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="NOTAS (OPCIONAL)">
            <div className="space-y-3">
              <Label htmlFor="notas">Observaciones</Label>
              <textarea
                id="notas"
                name="notas"
                rows={3}
                defaultValue={registro?.notas || ''}
                maxLength={500}
                placeholder="Instrucciones, observaciones, incidencias..."
                className="w-full rounded-xl bg-[#F8FAFC] px-4 py-3 text-[15px] font-medium text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-secondary/40 focus:bg-white resize-y min-h-[80px]"
              />
            </div>
          </FormSection>

          <div className="pt-8">
            <Button type="submit" disabled={pending} className="w-full h-12 bg-[#FF6A23] hover:bg-[#FF6A23]/90 text-white font-bold text-base rounded-xl">
              {pending ? 'Guardando...' : isEditing ? 'Actualizar Registro' : 'Guardar Registro'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [lotes, setLotes] = useState<any[]>([])
  const [selectedLoteId, setSelectedLoteId] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRegistro, setEditingRegistro] = useState<Registro | null>(null)
  
  // Custom delete modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [registroToDelete, setRegistroToDelete] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchLotes = async () => {
    const result = await obtenerLotes()
    if (result.success && result.data) setLotes(result.data)
  }

  const fetchRegistros = useCallback(async () => {
    setLoading(true)
    const result = await obtenerRegistros({ lote_id: selectedLoteId === 'all' ? undefined : selectedLoteId })
    if (result.success) setRegistros(result.data as Registro[])
    setLoading(false)
  }, [selectedLoteId])

  useEffect(() => { fetchLotes() }, [])
  useEffect(() => { fetchRegistros() }, [fetchRegistros])

  const handleDeleteClick = (id: string) => {
    setRegistroToDelete(id)
    setDeleteError(null)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!registroToDelete) return
    setDeleting(true)
    setDeleteError(null)
    const result = await eliminarRegistro(registroToDelete)
    setDeleting(false)
    if (result.success) {
      setDeleteConfirmOpen(false)
      setRegistroToDelete(null)
      fetchRegistros()
    } else {
      setDeleteError(result.error || 'Ocurrió un error al eliminar el registro')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingRegistro(null)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setEditingRegistro(null)
    fetchRegistros()
  }

  const lotesActivos = lotes.filter(l => l.activo)

  // Calcular el inventario restante de bultos (entradas - salidas)
  const inventarioRestante = registros.reduce(
    (sum, r) => sum + Number(r.alimento_bultos_ingresados || 0) - Number(r.alimento_bultos_gastados || 0),
    0
  )

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Registros Diarios</h2>
          <p className="text-sm text-muted-foreground">Gestiona los registros de producción de todos tus lotes</p>
        </div>

        {/* Inventario de Alimento Restante */}
        {!loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-secondary/20 bg-secondary/5 px-5 py-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Inventario de Alimento</p>
              <p className="text-xl font-black text-slate-800 leading-none mt-0.5">
                {inventarioRestante.toFixed(1)} <span className="text-xs font-bold text-slate-500">bultos</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={selectedLoteId} onValueChange={(v) => { if (v) setSelectedLoteId(v) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por lote" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Lotes</SelectItem>
              {lotes.map(lote => (
                <SelectItem key={lote.id} value={lote.id}>{lote.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} disabled={lotesActivos.length === 0} className="bg-[#FF6A23] hover:bg-[#FF6A23]/90 text-white font-bold">
            <Plus className="mr-2 h-4 w-4" />
            NUEVO REGISTRO
          </Button>
        </div>
      </div>

      {lotesActivos.length === 0 && !loading && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <strong>Atención:</strong> No tienes ningún Lote Activo. Ve a la pestaña "Lotes" y crea uno primero.
        </div>
      )}

      <RegistroForm
        registro={editingRegistro}
        lotesActivos={lotesActivos}
        open={showForm || !!editingRegistro}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={deleteConfirmOpen} onOpenChange={(o) => { if (!o) setDeleteConfirmOpen(false) }}>
        <DialogContent className="sm:max-w-[480px] p-0">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-xl font-bold text-red-600">
              ¿Eliminar Registro Diario?
            </DialogTitle>
          </DialogHeader>
          <div className="px-8 pb-8 space-y-6">
            <DialogDescription className="text-slate-500 text-[15px] leading-relaxed">
              Esta acción no se puede deshacer. Se eliminarán de forma permanente todos los datos asociados de este registro de producción y alimentación.
            </DialogDescription>

            {deleteError && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="h-11 px-5 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="h-11 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[#F8FAFC]">
                <th className="px-5 py-4 text-left text-xs font-black text-primary uppercase tracking-wider">Lote</th>
                <th className="px-5 py-4 text-left text-xs font-black text-primary uppercase tracking-wider">Fecha</th>
                <th className="px-5 py-4 text-right text-xs font-black text-primary uppercase tracking-wider">Aves Vivas</th>
                <th className="px-5 py-4 text-right text-xs font-black text-primary uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1"><Egg className="h-3 w-3" />Huevos</span>
                </th>
                <th className="px-5 py-4 text-right text-xs font-black text-primary uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1"><Skull className="h-3 w-3" />Muertes</span>
                </th>
                <th className="px-5 py-4 text-right text-xs font-black text-primary uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1"><Wheat className="h-3.5 w-3.5" />Gastado (Bultos)</span>
                </th>
                <th className="px-5 py-4 text-right text-xs font-black text-primary uppercase tracking-wider">
                  <span className="flex items-center justify-end gap-1"><Plus className="h-3.5 w-3.5" />Ingresado (Bultos)</span>
                </th>
                <th className="px-5 py-4 text-right text-xs font-black text-primary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">Cargando registros...</td></tr>
              ) : registros.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No hay registros aún.</td></tr>
              ) : (
                registros.map((r) => (
                  <tr key={r.id} className="border-b transition-colors hover:bg-[#F8FAFC]">
                    <td className="px-5 py-4 font-semibold text-secondary">{r.lotes?.nombre || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{format(new Date(r.fecha + 'T00:00:00'), 'dd/MM/yyyy')}</td>
                    <td className="px-5 py-4 text-right text-slate-700">{r.cantidad_gallinas}</td>
                    <td className="px-5 py-4 text-right font-bold text-slate-800">{r.huevos}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={r.muertes > 0 ? 'text-red-500 font-semibold' : 'text-slate-600'}>{r.muertes}</span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-600 font-semibold">{Number(r.alimento_bultos_gastados || 0).toFixed(1)}</td>
                    <td className="px-5 py-4 text-right text-green-600 font-bold">{Number(r.alimento_bultos_ingresados || 0) > 0 ? `+${Number(r.alimento_bultos_ingresados).toFixed(1)}` : '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditingRegistro(r); setShowForm(true) }} className="rounded-lg p-2 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors" title="Editar">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(r.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
