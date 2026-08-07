import { supabase } from '../supabase';
import type { KnownBug, CreateBugPayload } from '../types/bugs';

export async function fetchKnownBugs(): Promise<KnownBug[]> {
  const { data, error } = await supabase
    .from('known_bugs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar conhecidos de bugs:', error);
    throw error;
  }
  return data || [];
}

export async function createKnownBug(payload: CreateBugPayload): Promise<KnownBug> {
  const { data, error } = await supabase
    .from('known_bugs')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar conhecido de bug:', error);
    throw error;
  }
  return data;
}

export async function updateKnownBug(
  id: string,
  payload: Partial<KnownBug>
): Promise<KnownBug> {
  const { data, error } = await supabase
    .from('known_bugs')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar bug:', error);
    throw error;
  }
  return data;
}
