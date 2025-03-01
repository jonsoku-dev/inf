import type { Route } from ".react-router/types/app/common/pages/+types/home-page";
import { redirect } from "react-router";
import { getServerClient } from "~/server";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getServerClient(request)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  return redirect("/campaigns", {
    headers
  });
}
