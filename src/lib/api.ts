import { supabase } from './supabaseClient'

export async function getOrCreateCompany(ownerId: string) {
  const { data: list, error: e1 } = await supabase
    .from('company')
    .select('id,name')
    .eq('owner_id', ownerId)
    .limit(1)
  if (e1) throw e1
  if (list && list.length) return list[0]

  const { data, error } = await supabase
    .from('company')
    .insert({ owner_id: ownerId, name: 'บริษัทของฉัน' })
    .select('id,name')
    .single()
  if (error) throw error
  return data
}

export async function listDirectors(companyId: string) {
  const { data, error } = await supabase
    .from('director')
    .select('id,full_name,salary,premium,company_id')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function addDirector(companyId: string, d: { full_name?: string; salary?: number; premium?: number }) {
  const { data, error } = await supabase
    .from('director')
    .insert({ company_id: companyId, ...d })
    .select('id,full_name,salary,premium,company_id')
    .single()
  if (error) throw error
  return data
}

export async function updateDirector(id: string, patch: Partial<{ full_name: string; salary: number; premium: number }>) {
  const { data, error } = await supabase
    .from('director')
    .update(patch)
    .eq('id', id)
    .select('id,full_name,salary,premium,company_id')
    .single()
  if (error) throw error
  return data
}

export async function deleteDirector(id: string) {
  const { error } = await supabase.from('director').delete().eq('id', id)
  if (error) throw error
}
