import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "database.types";

export const createClient = ({
    supabaseUrl,
    supabaseKey
}: {
    supabaseUrl: string,
    supabaseKey: string
}) => createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
);

export const supabase = createClient({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
});