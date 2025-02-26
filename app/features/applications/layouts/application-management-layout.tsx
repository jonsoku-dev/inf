import { Link, Outlet, useLocation } from "react-router";
import { InboxIcon } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
} from "~/common/components/ui/sidebar";

export default function ApplicationManagementLayout() {
    const location = useLocation();

    return (
        <SidebarProvider className="h-[calc(100vh-14rem)] max-h-[calc(100vh-14rem)] min-h-full overflow-hidden">
            <Sidebar className="pt-16" variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/my/applications"}>
                                    <Link to="/my/applications">
                                        <InboxIcon className="size-4" />
                                        <span>지원 현황</span>
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