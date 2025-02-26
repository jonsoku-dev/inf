import { HomeIcon, LightbulbIcon, PackageIcon } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/common/components/ui/sidebar";

export default function DashboardLayout() {
  const location = useLocation();
  return (
    <SidebarProvider className="">
      <Sidebar className="pt-16" variant="floating">
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/my/dashboard"}>
                  <Link to="/my/dashboard">
                    <HomeIcon className="size-4" />
                    <span>홈</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/my/dashboard/ideas"}>
                  <Link to="/my/dashboard/ideas">
                    <LightbulbIcon className="size-4" />
                    <span>아이디어</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>제품 분석</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/my/dashboard/products/1"}
                >
                  <Link to="/my/dashboard/products/1">
                    <PackageIcon className="size-4" />
                    <span>제품 1</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="h-full w-full">
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
