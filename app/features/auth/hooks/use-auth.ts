import { useEffect, useState } from "react";
import { useSupabase } from "~/common/hooks/use-supabase";
import type { Database } from "database.types";

interface UseAuthReturn {
    user: Database['public']['Tables']['profiles']['Row'] | null;
    isLoading: boolean;
    isLoggedIn: boolean;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { supabase } = useSupabase();

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
    }, [supabase]);

    return { user, isLoading, isLoggedIn: !!user };
} 