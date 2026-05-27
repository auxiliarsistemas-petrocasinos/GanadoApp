'use server'

import { loteSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'

async function getSessionContext() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('No autorizado')
  }

  const { data: usuario, error: profileError } = await supabase
    .from('usuarios')
    .select('id, granja_id, rol')
    .eq('auth_user_id', user.id)
    .single()

  if (profileError || !usuario) {
    throw new Error('Perfil de usuario no encontrado')
  }

  return { supabase, user, usuario }
}

export async function crearLote(data: unknown) {
  try {
    const validado = loteSchema.parse(data)
    const { supabase, usuario } = await getSessionContext()

    const { data: lote, error } = await supabase
      .from('lotes')
      .insert({
        ...validado,
        fecha_inicio: validado.fecha_inicio.toISOString().split('T')[0],
        granja_id: usuario.granja_id,
        created_by_user_id: usuario.id,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/lotes')
    revalidatePath('/registros')
    revalidatePath('/dashboard')
    
    return { success: true, lote }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}

export async function obtenerLotes(activos?: boolean) {
  try {
    const { supabase, usuario } = await getSessionContext()

    let query = supabase
      .from('lotes')
      .select('*')
      .eq('granja_id', usuario.granja_id)
      .order('created_at', { ascending: false })

    if (activos !== undefined) {
      query = query.eq('activo', activos)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}

export async function toggleLoteActivo(id: string, activo: boolean) {
  try {
    const { supabase, usuario } = await getSessionContext()

    const { error } = await supabase
      .from('lotes')
      .update({ activo })
      .eq('id', id)
      .eq('granja_id', usuario.granja_id)

    if (error) throw error

    revalidatePath('/lotes')
    revalidatePath('/registros')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}

export async function eliminarLote(id: string) {
  try {
    const { supabase, usuario } = await getSessionContext()

    const { error } = await supabase
      .from('lotes')
      .delete()
      .eq('id', id)
      .eq('granja_id', usuario.granja_id)

    if (error) throw error

    revalidatePath('/lotes')
    revalidatePath('/registros')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}
