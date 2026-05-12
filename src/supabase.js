import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = 'presentations';
const DEFAULT_ID = 'default';

export async function loadDeck() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('deck_data')
    .eq('id', DEFAULT_ID)
    .single();

  if (error || !data) return null;
  return data.deck_data;
}

export async function saveDeck(deck) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: DEFAULT_ID, deck_data: deck, updated_at: new Date().toISOString() });

  if (error) console.error('Save error:', error);
}
