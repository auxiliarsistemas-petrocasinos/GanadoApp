'use server'

import { registroGallinasSchema } from '@/lib/validations'
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

function parseCleanInt(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  const str = String(val).replace(/[\.,\s]/g, '')
  return parseInt(str, 10) || 0
}

function parseCleanFloat(val: unknown): number {
  if (val === null || val === undefined || val === '') return 0
  let str = String(val).trim()
  
  if (str.includes('.') && str.includes(',')) {
    if (str.indexOf('.') < str.indexOf(',')) {
      str = str.replace(/\./g, '').replace(',', '.')
    } else {
      str = str.replace(/,/g, '')
    }
  } else if (str.includes(',')) {
    if (/,\d{1,2}$/.test(str)) {
      str = str.replace(',', '.')
    } else {
      str = str.replace(/,/g, '')
    }
  }
  return parseFloat(str) || 0
}

// 1. CREAR REGISTRO
export async function crearRegistro(prevState: unknown, formData: FormData) {
  let supabase
  let usuario
  try {
    const ctx = await getSessionContext()
    supabase = ctx.supabase
    usuario = ctx.usuario
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: message || 'No autorizado' }
  }

  const rawData = {
    lote_id: formData.get('lote_id') as string,
    fecha: formData.get('fecha') as string,
    huevos: parseCleanInt(formData.get('huevos')),
    muertes: parseCleanInt(formData.get('muertes')),
    alimento_bultos_gastados: parseCleanFloat(formData.get('alimento_bultos_gastados')),
    alimento_bultos_ingresados: parseCleanFloat(formData.get('alimento_bultos_ingresados')),
    notas: (formData.get('notas') as string) || undefined,
  }

  const validado = registroGallinasSchema.safeParse(rawData)

  if (!validado.success) {
    return {
      success: false,
      error: 'Validación fallida',
      fieldErrors: validado.error.flatten().fieldErrors,
      formErrors: validado.error.flatten().formErrors,
    }
  }

  // Obtener el lote para tener granja_id y cantidad_inicial
  const { data: lote, error: loteError } = await supabase
    .from('lotes')
    .select('granja_id, cantidad_inicial')
    .eq('id', validado.data.lote_id)
    .eq('granja_id', usuario.granja_id)
    .single()

  if (loteError || !lote) {
    return { success: false, error: 'Lote no encontrado' }
  }

  // Calcular aves vivas: cantidad_inicial - total muertes acumuladas
  const { data: registrosAnteriores } = await supabase
    .from('registros_gallinas')
    .select('muertes')
    .eq('lote_id', validado.data.lote_id)

  const muertesAcumuladas = (registrosAnteriores || []).reduce(
    (sum, r) => sum + (r.muertes || 0), 0
  )
  const cantidad_gallinas = lote.cantidad_inicial - muertesAcumuladas

  if (validado.data.muertes > cantidad_gallinas) {
    return {
      success: false,
      error: `Las muertes de hoy (${validado.data.muertes}) no pueden superar las aves vivas actuales (${cantidad_gallinas})`,
    }
  }

  // Verificar duplicados
  const { data: existe } = await supabase
    .from('registros_gallinas')
    .select('id')
    .eq('lote_id', validado.data.lote_id)
    .eq('fecha', validado.data.fecha)
    .maybeSingle()

  if (existe) {
    return {
      success: false,
      error: 'Ya existe un registro para esta fecha en este lote',
    }
  }

  const { data: registro, error } = await supabase
    .from('registros_gallinas')
    .insert({
      ...validado.data,
      granja_id: lote.granja_id,
      cantidad_gallinas,
      created_by_user_id: usuario.id,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/lotes/registros')
  revalidatePath('/dashboard')

  return { success: true, registro }
}

// 2. OBTENER REGISTROS
export async function obtenerRegistros(filtros?: {
  lote_id?: string
  fecha_inicio?: string
  fecha_fin?: string
  limit?: number
  offset?: number
}) {
  const { supabase, usuario } = await getSessionContext()

  let query = supabase
    .from('registros_gallinas')
    .select('*, lotes(nombre)', { count: 'exact' })
    .eq('granja_id', usuario.granja_id)
    .order('fecha', { ascending: false })

  if (filtros?.lote_id) {
    query = query.eq('lote_id', filtros.lote_id)
  }
  if (filtros?.fecha_inicio) {
    query = query.gte('fecha', filtros.fecha_inicio)
  }
  if (filtros?.fecha_fin) {
    query = query.lte('fecha', filtros.fecha_fin)
  }

  const limit = filtros?.limit || 100
  const offset = filtros?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [], count }
}

// 3. EDITAR REGISTRO
export async function editarRegistro(
  prevState: unknown,
  formData: FormData
) {
  let supabase
  let usuario
  try {
    const ctx = await getSessionContext()
    supabase = ctx.supabase
    usuario = ctx.usuario
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    return { success: false, error: message || 'No autorizado' }
  }
  const id = formData.get('id') as string

  const rawData = {
    lote_id: formData.get('lote_id') as string,
    fecha: formData.get('fecha') as string,
    huevos: parseCleanInt(formData.get('huevos')),
    muertes: parseCleanInt(formData.get('muertes')),
    alimento_bultos_gastados: parseCleanFloat(formData.get('alimento_bultos_gastados')),
    alimento_bultos_ingresados: parseCleanFloat(formData.get('alimento_bultos_ingresados')),
    notas: (formData.get('notas') as string) || undefined,
  }

  const validado = registroGallinasSchema.safeParse(rawData)

  if (!validado.success) {
    return {
      success: false,
      error: 'Validación fallida',
      fieldErrors: validado.error.flatten().fieldErrors,
      formErrors: validado.error.flatten().formErrors,
    }
  }

  // Recalcular aves vivas excluyendo el registro que se está editando
  const { data: lote } = await supabase
    .from('lotes')
    .select('granja_id, cantidad_inicial')
    .eq('id', validado.data.lote_id)
    .eq('granja_id', usuario.granja_id)
    .single()

  const { data: registrosAnteriores } = await supabase
    .from('registros_gallinas')
    .select('muertes')
    .eq('lote_id', validado.data.lote_id)
    .neq('id', id) // Excluir el registro actual

  const muertesAcumuladas = (registrosAnteriores || []).reduce(
    (sum, r) => sum + (r.muertes || 0), 0
  )
  const cantidad_gallinas = (lote?.cantidad_inicial || 0) - muertesAcumuladas

  const { data: registro, error } = await supabase
    .from('registros_gallinas')
    .update({
      ...validado.data,
      cantidad_gallinas,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('granja_id', usuario.granja_id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/lotes/registros')
  revalidatePath('/dashboard')

  return { success: true, registro }
}

// 4. ELIMINAR REGISTRO
export async function eliminarRegistro(id: string) {
  const { supabase, usuario } = await getSessionContext()

  const { error } = await supabase
    .from('registros_gallinas')
    .delete()
    .eq('id', id)
    .eq('granja_id', usuario.granja_id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/lotes/registros')
  revalidatePath('/dashboard')

  return { success: true }
}

// 5. OBTENER DATOS PARA DASHBOARD (últimos 30 días)
export async function obtenerDatosDashboard(loteId: string) {
  const { supabase, usuario } = await getSessionContext()

  if (!loteId) {
    return { success: false, error: 'Se requiere un lote_id', data: [] }
  }

  const { data, error } = await supabase
    .from('registros_gallinas')
    .select('*')
    .eq('lote_id', loteId)
    .eq('granja_id', usuario.granja_id)
    .order('fecha', { ascending: false })
    .limit(60) // Suficientes para 2 meses de tendencia

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data: data || [] }
}
