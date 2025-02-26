import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export const createClient = ({
    supabaseUrl,
    supabaseKey
}: {
    supabaseUrl: SupabaseClient['supabaseUrl'],
    supabaseKey: SupabaseClient['supabaseKey']
}) => createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!,
);

export const supabase = createClient({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
});