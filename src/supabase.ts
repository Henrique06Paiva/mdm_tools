import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Aviso: Supabase não está configurado no arquivo .env. O histórico de relatórios e auditorias não serão persistidos."
  );
}

// Usamos fallbacks de placeholder para evitar que o SDK quebre a inicialização da aplicação inteira com erros não capturados.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

