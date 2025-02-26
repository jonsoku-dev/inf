import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigation,
} from "react-router";

import { Settings } from "luxon";
import { Navigation } from "~/common/components/navigation";
import type { Route } from "./+types/root";
import "./app.css";
import { cn } from "./lib/utils";

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

export function Layout({ children }: { children: React.ReactNode }) {
  Settings.defaultLocale = "ko";
  Settings.defaultZone = "Asia/Tokyo";
  return (
    <html lang="en" className="">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <main className="">{children}</main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default async function App() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div
      className={cn({
        "px-20 py-28": !pathname.includes("/auth"),
        "opacity-50 transition-opacity duration-300 animate-pulse": isLoading,
      })}
    >
      {pathname.includes("auth") ? null : (
        <Navigation isLoggedIn={false} hasNotifications={true} hasMessages={true} />
      )}
      <Outlet />
    </div>
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
