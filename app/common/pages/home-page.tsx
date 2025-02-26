import type { Route } from ".react-router/types/app/common/pages/+types/home-page";
import { redirect } from "react-router";
import { getServerClient } from "~/server";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const supabase = getServerClient(request)
    const res = await supabase.auth.getSession()
    console.log(res)

    if (!res?.data?.session) {
      throw redirect("/auth/login")
    } else {
      throw redirect("/campaigns")
    }
  } catch (error) {
    console.error(error)
    throw redirect("/auth/login")
  }
}
