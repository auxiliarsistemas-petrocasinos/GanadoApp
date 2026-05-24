'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toggleLoteActivo, eliminarLote } from '@/actions/lotes'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'

export function LoteCard({ lote }: { lote: any }) {
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const handleToggle = () => {
    if (confirm(`¿Seguro que deseas marcar este lote como ${lote.activo ? 'inactivo' : 'activo'}?`)) {
      startTransition(() => {
        toggleLoteActivo(lote.id, !lote.activo)
      })
    }
  }

  const handleDelete = () => {
    if (confirm('¿ESTÁS SEGURO? Borrar este lote eliminará también todos sus registros diarios. Esta acción no se puede deshacer.')) {
      startDeleteTransition(() => {
        eliminarLote(lote.id)
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{lote.nombre}</CardTitle>
        <Badge variant={lote.activo ? "default" : "secondary"}>
          {lote.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mt-2 space-y-1">
          <p>
            <span className="font-semibold">Inicio:</span> {format(new Date(lote.fecha_inicio), "dd 'de' MMM, yyyy", { locale: es })}
          </p>
          <p>
            <span className="font-semibold">Cantidad Inicial:</span> {lote.cantidad_inicial} aves
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant={lote.activo ? "outline" : "default"} 
          className="flex-1"
          disabled={isPending || isDeleting}
          onClick={handleToggle}
        >
          {isPending ? 'Actualizando...' : lote.activo ? 'Finalizar Lote' : 'Reactivar Lote'}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          disabled={isPending || isDeleting}
          onClick={handleDelete}
          title="Eliminar lote"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
