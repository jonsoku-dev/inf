import type { Database } from "database.types";
import { useEffect, useState } from "react";
import { createClient } from "~/supa-client";

interface UseSupabaseAuth {
    user: Database['public']['Tables']['profiles']['Row'] | null;
    isLoading: boolean;
    isLoggedIn: boolean;
}

export function useSupabaseAuth(): UseSupabaseAuth {
    const [user, setUser] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [supabase] = useState(() => createClient({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY,
    }))
    useEffect(() => {
        // 현재 세션 확인 (비동기 처리)
        async function checkSession() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setUser(null);
                setIsLoading(false);
                return;
            }
            const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("profile_id", user.id)
                .single();
            setUser(profile ?? null);
            setIsLoading(false);
        }

        checkSession();
    }, []);

    return { user, isLoading, isLoggedIn: !!user };
} 