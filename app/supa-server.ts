import { createClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

const client = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_AMON_KEY!
);

export default client;



// import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr"

// export function createClient(request: Request) {
//     const headers = new Headers()

//     const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
//         cookies: {
//             getAll() {
//                 return parseCookieHeader(request.headers.get('Cookie') ?? '')
//             },
//             setAll(cookiesToSet) {
//                 cookiesToSet.forEach(({ name, value, options }) =>
//                     headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
//                 )
//             },
//         },
//     })

//     return { supabase, headers }
// }