import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = 'presentations';

export async function loadDeck(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('deck_data')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data.deck_data;
}

export async function saveDeck(id, deck) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id, deck_data: deck, updated_at: new Date().toISOString() });

  if (error) console.error('Save error:', error);
}

export async function deleteDeckRemote(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) console.error('Delete error:', error);
}
