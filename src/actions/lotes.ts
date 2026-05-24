'use server'

import { createClient } from '@supabase/supabase-js'
import { loteSchema } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function crearLote(data: unknown) {
  try {
    const validado = loteSchema.parse(data)
    const supabase = getSupabaseAdmin()

    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('id, granja_id')
      .limit(1)
      .single()

    if (!usuario) throw new Error("Usuario sin granja: " + (userError ? JSON.stringify(userError) : 'No user found'))

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
  } catch (error: any) {
    return { success: false, error: error.message || String(error) }
  }
}

export async function obtenerLotes(activos?: boolean) {
  try {
    const supabase = getSupabaseAdmin()

    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('granja_id')
      .limit(1)
      .single()

    if (!usuario) throw new Error("Usuario sin granja: " + (userError ? JSON.stringify(userError) : 'No user found'))

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
  } catch (error: any) {
    return { success: false, error: error.message || String(error) }
  }
}

export async function toggleLoteActivo(id: string, activo: boolean) {
  try {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('lotes')
      .update({ activo })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/lotes')
    revalidatePath('/registros')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || String(error) }
  }
}

export async function eliminarLote(id: string) {
  try {
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('lotes')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/lotes')
    revalidatePath('/registros')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || String(error) }
  }
}
