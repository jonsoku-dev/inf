import { useState } from "react";
import { createClient } from "~/supa-client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export function useSupabase() {
    const [supabase] = useState<SupabaseClient<Database>>(() => createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    }));

    return { supabase };
} 