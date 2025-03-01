import { Link, Outlet, useLocation } from "react-router";
import { PlusCircleIcon, ListIcon } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
} from "~/common/components/ui/sidebar";

export default function ProposalManagementLayout() {
    const location = useLocation();

    return (
        <SidebarProvider className="min-h-full overflow-hidden">
            <Sidebar className="pt-16" variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/my/proposals"}>
                                    <Link to="/my/proposals">
                                        <ListIcon className="size-4" />
                                        <span>제안 목록</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/my/proposals/new"}>
                                    <Link to="/my/proposals/new">
                                        <PlusCircleIcon className="size-4" />
                                        <span>새 제안</span>
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