import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, supabase } from "~/supa-client";

interface UseSupabaseAuth {
    user: User | null;
    isLoading: boolean;
}

export function useSupabaseAuth(): UseSupabaseAuth {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 현재 세션 확인 (비동기 처리)
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        }

        checkSession();
    }, []);

    return { user, isLoading };
} 