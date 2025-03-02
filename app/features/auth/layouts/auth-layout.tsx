import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-2">
      <AuthBackground />
      <div className="flex flex-1 items-center justify-center px-4 py-8 md:px-8">
        <Outlet />
      </div>
    </div>
  );
}

function AuthBackground() {
  return (
    <div className="from-primary to-primary/50 bg-gradient-to-br via-black hidden md:block md:h-auto" />
  );
}
