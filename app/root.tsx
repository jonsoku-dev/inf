import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
  useNavigation
} from "react-router";

import { Settings } from "luxon";
import Navigation from "~/common/components/navigation";
import { Toaster } from "~/common/components/ui/sonner";
import { cn } from "~/lib/utils";
import { getServerClient } from "~/server";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  let unreadAlertCount = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (profile) {
      const { count } = await supabase
        .from("alerts")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", profile.profile_id)
        .eq("alert_status", "UNREAD");

      unreadAlertCount = count || 0;
    }

    return {
      isAuthenticated: !!user,
      unreadAlertCount,
      profile: profile,
    }
  }

  return {
    isAuthenticated: false,
    unreadAlertCount: 0,
    profile: null,
  }
};

export default function Root() {
  const { isAuthenticated, unreadAlertCount, profile } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  // 기본 설정
  Settings.defaultLocale = "ko";
  Settings.defaultZone = "Asia/Tokyo";

  return (
    <html lang="ko" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body >
        <main className="min-h-full">
          <div className={cn({
            "px-20 py-28": !pathname.includes("/auth"),
            "opacity-50 transition-opacity duration-300 animate-pulse": isLoading,
          })}>
            {isAuthenticated && <Navigation unreadAlertCount={unreadAlertCount} profile={profile} />}
            <Outlet />
          </div>
          <Toaster />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
