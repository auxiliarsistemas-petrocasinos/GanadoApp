'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormSection } from '@/components/ui/form-section'
import { crearLote } from '@/actions/lotes'

export function CrearLoteForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    // Sanitizar la cantidad inicial eliminando puntos, comas y espacios de miles
    const rawCantidad = formData.get('cantidad_inicial') as string
    const cantidadLimpia = rawCantidad ? parseInt(rawCantidad.replace(/[\.,\s]/g, ''), 10) : 0

    const data = {
      nombre: formData.get('nombre'),
      fecha_inicio: formData.get('fecha_inicio'),
      cantidad_inicial: cantidadLimpia,
      activo: true,
    }

    const res = await crearLote(data)

    setLoading(false)

    if (res.success) {
      setOpen(false)
      router.refresh()
    } else {
      setError(res.error || 'Ocurrió un error al crear el lote')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600 font-bold" />}>
        <Plus className="mr-2 h-4 w-4" />
        CREAR LOTE
      </DialogTrigger>
      
      {/* Remove padding to let Header and content breathe on their own */}
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle>Crear Nuevo Lote de Producción</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="px-8 pb-8 space-y-2">
          {error && <div className="text-red-500 text-sm font-semibold mb-4">{error}</div>}
          
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <Label htmlFor="nombre">Nombre o Identificador</Label>
              <Input id="nombre" name="nombre" placeholder="Ej. Lote 1 - Ponedoras" required />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input id="fecha_inicio" name="fecha_inicio" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className="space-y-3 pt-6">
            <Label htmlFor="cantidad_inicial">Cantidad Inicial de Gallinas</Label>
            <Input
              id="cantidad_inicial"
              name="cantidad_inicial"
              type="text"
              inputMode="numeric"
              pattern="[0-9.,\s]*"
              placeholder="Ej: 19.102"
              required
            />
          </div>

          {/* Dummy FormSection para mostrar que el componente funciona y simular formulario grande */}
          <FormSection title="INFORMACIÓN ADICIONAL (OPCIONAL)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="raza">Raza / Línea</Label>
                <Input id="raza" name="raza" placeholder="Ej: Isa Brown" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="proveedor">Proveedor de Aves</Label>
                <Input id="proveedor" name="proveedor" placeholder="Ej: Avícola Andina" />
              </div>
            </div>
          </FormSection>

          <div className="pt-8">
            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#FF6A23] hover:bg-[#FF6A23]/90 text-white font-bold text-base rounded-xl">
              {loading ? "Guardando..." : "Registrar Lote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
