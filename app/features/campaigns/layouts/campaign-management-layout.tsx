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

export default function CampaignManagementLayout() {
    const location = useLocation();

    return (
        <SidebarProvider className="min-h-full overflow-hidden">
            <Sidebar className="pt-16" variant="floating">
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/my/campaigns"}>
                                    <Link to="/my/campaigns">
                                        <ListIcon className="size-4" />
                                        <span>캠페인 목록</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={location.pathname === "/my/campaigns/new"}>
                                    <Link to="/my/campaigns/new">
                                        <PlusCircleIcon className="size-4" />
                                        <span>새 캠페인</span>
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