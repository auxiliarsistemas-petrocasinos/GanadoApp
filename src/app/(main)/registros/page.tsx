import { redirect } from 'next/navigation'

// Redirect permanente de /registros a /lotes/registros (sub-módulo de Gallinas)
export default function RegistrosRedirect() {
  redirect('/lotes/registros')
}
