// src/utils/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export async function loadUserData(userId) {
  const { data, error } = await supabase
    .from("user_data")
    .select("plants, favorites, is_pro, ai_calls_used, member_number, scan_count")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function saveUserData(userId, payload) {
  const { error } = await supabase
    .from("user_data")
    .upsert({
      user_id:    userId,
      plants:     payload.plants     || [],
      favorites:  payload.favorites  || [],
      scan_count: payload.scan_count || 0,
      updated_at: new Date().toISOString(),
    });
  if (error) throw error;
}
