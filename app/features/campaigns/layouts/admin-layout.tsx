import { Link, Outlet, useLocation } from "react-router";
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from "~/common/components/ui/sidebar";
import { ListIcon } from "lucide-react";

export default function AdminLayout() {
    const location = useLocation();

    return (
        <SidebarProvider className="min-h-full overflow-hidden">
            <Sidebar className="pt-16" variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/campaigns/admin"}>
                                    <Link to="/campaigns/admin">
                                        <ListIcon className="size-4" />
                                        <span>캠페인 관리</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <div className="w-full pl-20">
                <Outlet />
            </div>
        </SidebarProvider>
    );
} 