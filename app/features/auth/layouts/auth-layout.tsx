import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <div className="grid h-screen grid-cols-2">
      <AuthBackground />
      <Outlet />
    </div>
  );
}

function AuthBackground() {
  return <div className="from-primary to-primary/50 bg-gradient-to-br via-black" />;
}
