'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toggleLoteActivo } from '@/actions/lotes'
import { useTransition } from 'react'

export function LoteCard({ lote }: { lote: any }) {
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    if (confirm(`¿Seguro que deseas marcar este lote como ${lote.activo ? 'inactivo' : 'activo'}?`)) {
      startTransition(() => {
        toggleLoteActivo(lote.id, !lote.activo)
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
      <CardFooter>
        <Button 
          variant={lote.activo ? "outline" : "default"} 
          className="w-full"
          disabled={isPending}
          onClick={handleToggle}
        >
          {isPending ? 'Actualizando...' : lote.activo ? 'Marcar como Finalizado' : 'Reactivar Lote'}
        </Button>
      </CardFooter>
    </Card>
  )
}
