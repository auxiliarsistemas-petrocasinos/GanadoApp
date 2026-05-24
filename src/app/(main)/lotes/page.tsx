import { obtenerLotes } from "@/actions/lotes"
import { CrearLoteForm } from "./_components/crear-lote-form"
import { LoteCard } from "./_components/lote-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function LotesPage() {
  const { success, data: lotes, error } = await obtenerLotes()

  if (!success) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error al cargar los lotes</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const activos = lotes?.filter(l => l.activo) || []
  const inactivos = lotes?.filter(l => !l.activo) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Lotes de Producción</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Administra los lotes activos de tu granja.
          </p>
        </div>
        <CrearLoteForm />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Lotes Activos</h3>
          {activos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tienes lotes activos en este momento.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activos.map(lote => (
                <LoteCard key={lote.id} lote={lote} />
              ))}
            </div>
          )}
        </div>

        {inactivos.length > 0 && (
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Historial — Lotes Inactivos</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-70">
              {inactivos.map(lote => (
                <LoteCard key={lote.id} lote={lote} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
